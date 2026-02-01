import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EquipmentBox, ExclusionZone } from '../types';
import { playScanSound, playBoxDropSound } from '../utils/sound';

// All the helper functions (calculateDistance, KOREA_ADMIN_DIVISIONS, etc.) are assumed to be here.
// For brevity, I will omit them from this code block, but they are part of the file.

// 대한민국 행정구역 데이터
const KOREA_ADMIN_DIVISIONS: Record<string, string[]> = {
  "서울특별시": ["서울특별시"],
  "경기도": ["가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시"],
  "인천광역시": ["인천광역시", "강화군", "옹진군"],
  "강원특별자치도": ["강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군"],
  "충청북도": ["괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군", "청주시", "충주시"],
  "충청남도": ["계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군", "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군"],
  "대전광역시": ["대전광역시"],
  "세종특별자치시": ["세종시"],
  "전북특별자치도": ["고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군"],
  "전라남도": ["강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
  "광주광역시": ["광주광역시"],
  "경상북도": ["경산시", "경주시", "고령군", "구미시", "군위군", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시"],
  "경상남도": ["거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군"],
  "대구광역시": ["대구광역시", "군위군", "달성군"],
  "울산광역시": ["울산광역시", "울주군"],
  "부산광역시": ["부산광역시", "기장군"],
  "제주특별자치도": ["서귀포시", "제주시"]
};
const OVERPASS_SERVERS = ["https://overpass-api.de/api/interpreter","https://lz4.overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180); const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*(Math.PI/180))*Math.cos(lat2*(Math.PI/180))*Math.sin(dLon/2)*Math.sin(dLon/2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c;};
const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => { const startLatRad = startLat * (Math.PI / 180); const startLngRad = startLng * (Math.PI / 180); const destLatRad = destLat * (Math.PI / 180); const destLngRad = destLng * (Math.PI / 180); const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad); const x = Math.cos(startLatRad) * Math.sin(destLatRad) - Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad); let brng = Math.atan2(y, x); brng = brng * (180 / Math.PI); return (brng + 360) % 360; };
const getDirectionString = (angle: number) => { const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서']; const index = Math.round(angle / 22.5) % 16; return directions[index]; };
const isPointInPolygon = (lat: number, lng: number, polygon: number[][]) => { let inside = false; for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { const xi = polygon[i][0], yi = polygon[i][1]; const xj = polygon[j][0], yj = polygon[j][1]; const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi); if (intersect) inside = !inside; } return inside; };
const isPointInGeoJSON = (lat: number, lng: number, geojson: any) => { if (geojson.type === 'Polygon') { return isPointInPolygon(lat, lng, geojson.coordinates[0]); } else if (geojson.type === 'MultiPolygon') { for (const polygon of geojson.coordinates) { if (isPointInPolygon(lat, lng, polygon[0])) return true; } } return false; };
const fetchWithRetry = async (url: string, retries = 3, delay = 800) => { if (typeof navigator !== 'undefined' && !navigator.onLine) { throw new Error("No Internet Connection"); } for (let i = 0; i < retries; i++) { try { const controller = new AbortController(); const id = setTimeout(() => controller.abort(), 15000); const res = await fetch(url, { signal: controller.signal }); clearTimeout(id); if (!res.ok) { if(res.status === 429 || res.status >= 500) { await new Promise(r => setTimeout(r, delay * 2 * (i + 1))); continue; } throw new Error(`HTTP ${res.status}`); } return await res.json(); } catch (e) { if (i === retries - 1) throw e; await new Promise(r => setTimeout(r, delay * (i + 1))); } } return null; };
const getCityFromCoords = async (lat: number, lng: number): Promise<string> => { try { const response = await fetchWithRetry(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1&accept-language=ko`, 2); if (response && !response.error) { const a = response.address; const region1 = a.province || a.state || a.city || ''; const region2 = a.district || a.county || a.town || ''; if (region1 || region2) { return `${region1} ${region2}`.trim(); } } } catch (e) { console.warn("OSM Geocoding Skipped:", e); } return "야생의 어딘가"; };
const snapToCivilizationOSM = async (lat: number, lng: number): Promise<{lat: number, lng: number, name: string} | null> => { const query = `[out:json][timeout:3];(way(around:300, ${lat}, ${lng})["highway"];way(around:300, ${lat}, ${lng})["building"];node(around:300, ${lat}, ${lng})["amenity"];node(around:300, ${lat}, ${lng})["shop"];);out geom 1;`; for (const server of OVERPASS_SERVERS) { try { const data = await fetchWithRetry(`${server}?data=${encodeURIComponent(query)}`, 3, 1000); // Use fetchWithRetry with 3 retries and 1s delay
      if (data && data.elements && data.elements.length > 0) { const el = data.elements[0]; let snappedLat = lat; let snappedLng = lng; let name = "도로/건물 인근"; if (el.type === 'node') { snappedLat = el.lat; snappedLng = el.lon; name = el.tags?.name || (el.tags?.shop ? '상점' : '시설'); } else if (el.type === 'way' && el.geometry && el.geometry.length > 0) { snappedLat = el.geometry[0].lat; snappedLng = el.geometry[0].lon; name = el.tags?.name || (el.tags?.building ? '건물' : '도로'); } return { lat: snappedLat, lng: snappedLng, name }; } } catch (e) { console.warn("Overpass snap failed on server:", server, e); } } return null; };


interface MapModeProps {
  currentPosition: { lat: number; lng: number } | null;
  activeBox: EquipmentBox | null;
  visitedCities: string[];
  onTeleport: (lat: number, lng: number, name: string) => void;
  onAddVisitedCity: (city: string) => void;
  onRemoveVisitedCity: (city: string) => void;
  setCurrentCityName: (city: string) => void;
  currentCityName: string | null;
  onRefreshGPS: () => void;
  onSpawnBox: (box: EquipmentBox | null) => void;
  onAcquireBox: () => void;
  exclusionZones: ExclusionZone[];
  setExclusionZones: React.Dispatch<React.SetStateAction<ExclusionZone[]>>;
  coinBalance: number;
  setCoinBalance: React.Dispatch<React.SetStateAction<number>>;
}

// Helper component to handle map events
interface MapEventsProps {
  onMapClick: (latlng: L.LatLng) => void;
  isJammerMode: boolean;
}
const MapEvents: React.FC<MapEventsProps> = ({ onMapClick, isJammerMode }) => {
  const map = useMap();

  useEffect(() => {
    map.getContainer().style.cursor = isJammerMode ? 'crosshair' : '';
  }, [isJammerMode, map]);

  useMapEvents({
    click(e) {
      if (isJammerMode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

// Helper component to recenter the map view
interface ChangeViewProps {
  center: L.LatLngExpression;
  zoom: number;
}
const ChangeView: React.FC<ChangeViewProps> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};


const MapMode: React.FC<MapModeProps> = ({ 
  currentPosition, 
  activeBox,
  onTeleport, 
  setCurrentCityName, 
  currentCityName,
  onSpawnBox,   
  onAcquireBox,
  exclusionZones,
  setExclusionZones,
  coinBalance,
  setCoinBalance
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(""); 
  const [scanDirection, setScanDirection] = useState('ALL');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [zoneSearchText, setZoneSearchText] = useState("");
  const [isZoneSearching, setIsZoneSearching] = useState(false);
  const [modalLoadingText, setModalLoadingText] = useState(""); 
  const [isJammerMode, setIsJammerMode] = useState(false);
  const [pendingJammer, setPendingJammer] = useState<{lat: number, lng: number, name: string} | null>(null);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [targetLocation, setTargetLocation] = useState<{lat: number, lng: number, dist: number, direction: string} | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  
  const initialCenter: L.LatLngExpression = useMemo(() => (currentPosition ? [currentPosition.lat, currentPosition.lng] : [37.5665, 126.9780]), [currentPosition]);
  const SOUTH_KOREA_BOUNDS: L.LatLngBoundsExpression = [[33.0, 124.5], [38.9, 132.0]];

  //ICONS (memoized for performance)
  const userIcon = useMemo(() => L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="position:relative; width:100%; height:100%; display:flex; justify-content:center; align-items:center;"><div style="width:24px; height:24px; background:#3B82F6; border:3px solid white; border-radius:50%; box-shadow:0 0 15px rgba(59,130,246,0.6); z-index:2;"></div><div style="position:absolute; width:40px; height:40px; background:rgba(59,130,246,0.3); border-radius:50%; animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div><div style="position:absolute; top:-35px; background:white; color:#1e293b; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; white-space:nowrap; border:2px solid #3B82F6; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${currentCityName || '내 위치'}</div></div>`,
      iconSize: [40, 40], iconAnchor: [20, 20]
  }), [currentCityName]);

  const boxIcon = useMemo(() => L.divIcon({
      className: 'custom-box-marker',
      html: `<div style="display:flex; flex-direction:column; align-items:center; animation: bounce 2s infinite;"><div style="font-size:36px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));">📦</div><div style="background:white; padding:4px 8px; border-radius:12px; font-size:11px; font-weight:bold; border:2px solid #22C55E; color: #15803D; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap;">${activeBox?.city || '목표 지점'}</div></div>`,
      iconSize: [60, 60], iconAnchor: [30, 50]
  }), [activeBox]);

  const pendingJammerIcon = useMemo(() => L.divIcon({
    html: `<div style="position:relative; width:40px; height:40px; display:flex; justify-content:center; align-items:center;"><div style="position:absolute; width:100%; height:100%; background:rgba(124, 58, 237, 0.4); border-radius:50%; animation:ping 1.5s infinite;"></div><div style="font-size:24px;">📍</div></div>`,
    className: 'pending-jammer-icon', iconSize: [40, 40], iconAnchor: [20, 20]
  }), []);


  useEffect(() => {
    const nkZoneId = 'restricted-nk';
    if (!exclusionZones.some(z => z.id === nkZoneId)) {
        const nkPolygonCoordinates = [[128.37, 38.62], [128.00, 38.30], [127.50, 38.25], [127.20, 38.20], [127.00, 38.15], [126.80, 38.00], [126.70, 37.96], [126.60, 37.90], [126.50, 37.80], [126.25, 37.85], [126.00, 37.80], [125.00, 37.70], [124.00, 37.70], [124.00, 43.50], [131.00, 43.50], [131.00, 38.62], [128.37, 38.62]];
        const nkZone: ExclusionZone = { id: nkZoneId, lat: 38.5, lng: 127.0, radius: 0, name: "북한 지역 (진입 불가)", type: 'MANUAL', geojson: { type: 'Polygon', coordinates: [nkPolygonCoordinates] } };
        setExclusionZones(prev => [nkZone, ...prev]);
    }
  }, [exclusionZones, setExclusionZones]);

  useEffect(() => {
    if (activeBox && currentPosition) {
        const dist = calculateDistance(currentPosition.lat, currentPosition.lng, activeBox.lat, activeBox.lng);
        const bearing = calculateBearing(currentPosition.lat, currentPosition.lng, activeBox.lat, activeBox.lng);
        const direction = getDirectionString(bearing);
        setTargetLocation({ lat: activeBox.lat, lng: activeBox.lng, dist: parseFloat(dist.toFixed(2)), direction });
    } else {
        setTargetLocation(null);
    }
  }, [activeBox, currentPosition]);

  useEffect(() => {
    let isMounted = true;
    if (currentPosition) {
        getCityFromCoords(currentPosition.lat, currentPosition.lng).then(name => {
            if (isMounted && name) setCurrentCityName(name);
        });
    }
    return () => { isMounted = false; };
  }, [currentPosition, setCurrentCityName]);
  
  const handleMapClick = useCallback(async (latlng: L.LatLng) => {
      if (isResolvingAddress || pendingJammer) return;

      const { lat, lng } = latlng;
      setIsResolvingAddress(true);
      try {
          const namePromise = getCityFromCoords(lat, lng);
          const fallbackName = `좌표(${lat.toFixed(3)}, ${lng.toFixed(3)})`;
          const name = await Promise.race([namePromise, new Promise<string>((resolve) => setTimeout(() => resolve(fallbackName), 2500))]) || fallbackName;
          setPendingJammer({ lat, lng, name });
      } catch (err) {
          console.error("Manual placement error:", err);
          setPendingJammer({ lat, lng, name: `미확인 지역 (${lat.toFixed(3)}, ${lng.toFixed(3)})` });
      } finally {
          setIsResolvingAddress(false);
      }
  }, [isResolvingAddress, pendingJammer]);

  const confirmJammerPlacement = () => {
      if (!pendingJammer) return;
      const newZone: ExclusionZone = { id: `manual-click-${Date.now()}`, lat: pendingJammer.lat, lng: pendingJammer.lng, radius: 5, name: `${pendingJammer.name} (수동)`, type: 'MANUAL', geojson: null };
      setExclusionZones(prev => [...prev, newZone]);
      setPendingJammer(null);
      setIsJammerMode(false); 
  };
  
  // All other handlers like handleSearch, handleAddManualZone, etc. are assumed to be here.
  // Omitted for brevity.
  const searchNominatim = async (query: string) => { return await fetchWithRetry(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=kr&limit=50&polygon_geojson=1`); };
  const getCoordsOnly = async (query: string): Promise<{lat: number, lon: number} | null> => { try { const data = await fetchWithRetry(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=kr&limit=1`); if (data && data.length > 0) { return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }; } } catch (e) { console.warn("Simple coord fetch failed", e); } return null; };
  const fetchRelIdFromOverpass = async (cityName: string): Promise<number | null> => { const query = `[out:json][timeout:5]; area["ISO3166-1"="KR"]->.searchArea; relation["name"="${cityName}"](area.searchArea); out ids;`; for (const server of OVERPASS_SERVERS) { try { const url = `${server}?data=${encodeURIComponent(query)}`; const data = await fetchWithRetry(url, 1, 500); if (data && data.elements && data.elements.length > 0) { return data.elements[0].id; } } catch (e) { console.warn(`Overpass lookup failed on ${server}`, e); } } return null; };
  const fetchGeoJSONFromNominatimLookup = async (osmId: number) => { const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=R${osmId}&polygon_geojson=1&format=json`; const data = await fetchWithRetry(url); if(data && data.length > 0) return data[0]; return null; };
  const findBestBoundary = (data: any[]) => { if (!data) return null; const candidates = data.filter((item: any) => item.geojson && (item.geojson.type === 'Polygon' || item.geojson.type === 'MultiPolygon')); if (candidates.length === 0) return null; candidates.sort((a, b) => { if (a.osm_type === 'relation' && b.osm_type !== 'relation') return -1; if (a.osm_type !== 'relation' && b.osm_type === 'relation') return 1; if (a.class === 'boundary' && b.class !== 'boundary') return -1; if (a.class !== 'boundary' && b.class === 'boundary') return 1; return (b.importance || 0) - (a.importance || 0); }); return candidates[0]; };
  const addZoneLogic = async (targetName: string, provinceInput?: string, silent: boolean = false, saveAsName?: string): Promise<boolean> => { try { let rawData; let bestMatch; const queries = []; if (provinceInput) { queries.push(`${targetName} ${provinceInput} administrative boundary`); } queries.push(`${targetName} administrative boundary`); queries.push(`${targetName} South Korea`); for (const q of queries) { if (!silent) console.log(`Strategy (Nominatim) Searching for: ${q}`); rawData = await searchNominatim(q); bestMatch = findBestBoundary(rawData); if (bestMatch) break; } if (!bestMatch) { if(!silent) console.log(`Strategy (Overpass) Searching for Relation ID: ${targetName}`); const relId = await fetchRelIdFromOverpass(targetName); if (relId) { if(!silent) console.log(`Overpass found Relation ID: ${relId}. Fetching Geometry...`); const geoData = await fetchGeoJSONFromNominatimLookup(relId); if (geoData) { bestMatch = geoData; } } } const finalName = saveAsName || targetName; if (bestMatch) { const place = bestMatch; const newLat = parseFloat(place.lat); const newLng = parseFloat(place.lon); setExclusionZones(prev => { const isDuplicate = prev.some(z => z.name === finalName || (Math.abs(z.lat - newLat) < 0.0001 && Math.abs(z.lng - newLng) < 0.0001) ); if (isDuplicate) return prev; const newZone: ExclusionZone = { id: `manual-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, lat: newLat, lng: newLng, radius: 8, name: finalName, type: 'MANUAL', geojson: place.geojson }; return [...prev, newZone]; }); return true; } else { if (!silent) console.log("Polygon failed, falling back to Circle Jammer"); let coords = await getCoordsOnly(targetName); if (!coords && provinceInput) coords = await getCoordsOnly(`${provinceInput} ${targetName}`); if (!coords) coords = await getCoordsOnly(`${targetName} South Korea`); if (coords) { setExclusionZones(prev => { const isDuplicate = prev.some(z => z.name === finalName); if (isDuplicate) return prev; const newZone: ExclusionZone = { id: `manual-fallback-${Date.now()}`, lat: coords!.lat, lng: coords!.lon, radius: 5, name: finalName, type: 'MANUAL', geojson: null }; return [...prev, newZone]; }); if (!silent) alert(`경계선 데이터가 없어 반경 5km 재머(원형)로 대체 차단합니다: ${finalName}`); return true; } else { if (!silent) alert(`'${targetName}'의 위치를 찾을 수 없습니다.\n차단에 실패했습니다.`); return false; } } } catch (e) { console.error(e); if (!silent) alert("검색 중 오류가 발생했습니다."); return false; } };
  const handleAddManualZone = async (nameInput?: string, provinceInput?: string) => { if (isZoneSearching) return; const targetName = nameInput || zoneSearchText; if (!targetName.trim()) return; const isDuplicate = exclusionZones.some(z => z.name === targetName); if (isDuplicate) { alert("이미 등록된 지역입니다."); if(!nameInput) setZoneSearchText(""); return; } setIsZoneSearching(true); await addZoneLogic(targetName, provinceInput); if(!nameInput) setZoneSearchText(""); setIsZoneSearching(false); };
  const handleToggleCity = async (city: string, province: string) => { if (isZoneSearching) return; const uniqueName = `${city} (${province})`; const existingZone = exclusionZones.find(z => z.name === uniqueName || z.name === city); if (existingZone) { removeZone(existingZone.id); } else { setIsZoneSearching(true); await addZoneLogic(city, province, false, uniqueName); setIsZoneSearching(false); } };
  const handleToggleProvince = async (province: string, cities: string[]) => { if (isZoneSearching) return; const activeInProvince = exclusionZones.filter(z => cities.some(c => z.name === `${c} (${province})` || z.name === c) ); const allActive = activeInProvince.length >= cities.length;

  if (allActive) {
      const idsToRemove = activeInProvince.map(z => z.id);
      setExclusionZones(prev => prev.filter(z => !idsToRemove.includes(z.id)));
  } else {
      const missing = cities.filter(c => !exclusionZones.some(z => z.name === c || z.name === `${c} (${province})`));
      setIsZoneSearching(true);
      setModalLoadingText(`${missing.length}개 도시 처리 중...`);
      
      for (let i = 0; i < missing.length; i++) {
          setModalLoadingText(`${missing.length - i}개 남음 (${missing[i]})...`);
          await addZoneLogic(missing[i], province, true, `${missing[i]} (${province})`); 
          await new Promise(r => setTimeout(r, 800));
      }
      
      setModalLoadingText("");
      setIsZoneSearching(false);
  }
};
  const removeZone = (id: string) => { if (id === 'restricted-nk') { alert("북한 지역 차단은 해제할 수 없습니다."); return; } setExclusionZones(prev => prev.filter(z => z.id !== id)); };
  const handleDevWarp = () => { if(!targetLocation) return; onTeleport(targetLocation.lat, targetLocation.lng, "Warped Location"); };
  const handleOpenNaverMap = () => { if(!targetLocation) return; if (currentPosition) { const url = `https://map.naver.com/p/directions/${currentPosition.lng},${currentPosition.lat},내위치/${targetLocation.lng},${targetLocation.lat},보급품/-/bicycle`; window.open(url, '_blank'); } else { window.open(`https://map.naver.com/p/search/${targetLocation.lat},${targetLocation.lng}`, '_blank'); } };
  const handleOpenKakaoMap = () => { if(!targetLocation) return; const url = `https://map.kakao.com/link/to/보급품,${targetLocation.lat},${targetLocation.lng}`; window.open(url, '_blank'); };
  const handleSearch = async (options: { bypassCost?: boolean; minDist?: number; maxDist?: number } = {}) => { const { bypassCost = false, minDist = 5, maxDist = 10 } = options;

    if (!currentPosition) {
        alert("GPS 신호를 찾을 수 없습니다.");
        return;
    }

    if (!bypassCost && scanDirection !== 'ALL' && coinBalance < 1) {
        alert("코인이 부족합니다. 정밀 탐색에는 코인 1개가 필요합니다.");
        return;
    }

    if (!bypassCost && scanDirection !== 'ALL') {
        setCoinBalance(prev => prev - 1);
    }

    setLoading(true);
    setLoadingText("🛰️ 위성 업링크 연결 및 보안 프로토콜 가동...");

    setTimeout(async () => {
        try {
            const { lat, lng } = currentPosition;
            const R = 6371; 
            
            let foundValidPoint = false;
            let newLat = 0;
            let newLng = 0;
            let attempts = 0;
            const MAX_ATTEMPTS = 10; 

            const SCAN_MESSAGES = [
                "지형 데이터 스펙트럼 분석 중...",
                "전파 방해 신호 우회 시도...",
                "보급품 투하 궤도(LZ) 계산 중...",
                "고밀도 신호 패턴 해독 중...",
                "주변 안전 구역 스캔 중...",
                "대기권 진입 시뮬레이션 중...",
                "레이더 주파수 동기화 중..."
            ];

            while (!foundValidPoint && attempts < MAX_ATTEMPTS) {
                attempts++;
                const randomMsg = SCAN_MESSAGES[attempts % SCAN_MESSAGES.length];
                setLoadingText(`📡 ${randomMsg} (${attempts}/${MAX_ATTEMPTS})`);
                
                playScanSound();

                const dist = minDist + Math.random() * (maxDist - minDist);
                let bearing = 0;

                if (scanDirection === 'ALL') {
                    bearing = Math.random() * 360;
                } else {
                    const dirMap: Record<string, number> = { 'N': 0, 'E': 90, 'S': 180, 'W': 270 };
                    const base = dirMap[scanDirection] || 0;
                    bearing = (base - 45 + Math.random() * 90 + 360) % 360;
                }

                const lat1 = lat * (Math.PI / 180);
                const lon1 = lng * (Math.PI / 180);
                const brng = bearing * (Math.PI / 180);

                const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist / R) + Math.cos(lat1) * Math.sin(dist / R) * Math.cos(brng));
                const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist / R) * Math.cos(lat1), Math.cos(dist / R) - Math.sin(lat1) * Math.sin(lat2));

                const tempLat = lat2 * (180 / Math.PI);
                const tempLng = lon2 * (180 / Math.PI);

                const isRestricted = exclusionZones.some(z => {
                    if (z.type === 'MANUAL' && z.geojson) {
                        return isPointInGeoJSON(tempLat, tempLng, z.geojson);
                    } else {
                        const distZ = calculateDistance(tempLat, tempLng, z.lat, z.lng);
                        return distZ <= z.radius;
                    }
                });

                if (!isRestricted) {
                    const snappedPoint = await snapToCivilizationOSM(tempLat, tempLng);
                    if (snappedPoint) {
                        newLat = snappedPoint.lat;
                        newLng = snappedPoint.lng;
                        foundValidPoint = true;
                    }
                }
            }

            if (!foundValidPoint) {
                setLoadingText("⚠️ 신호 소실: 착륙 좌표 확보 실패");
                await new Promise(r => setTimeout(r, 1000));
                setLoading(false);
                alert("주변에 안전한 건물이나 도로가 없습니다. (바다/산악 지형 회피)\\n또는 네트워크 상태를 확인해주세요.");
                return;
            }

            const city = await getCityFromCoords(newLat, newLng);

            const newBox: EquipmentBox = {
                id: `box-${Date.now()}`,
                lat: newLat,
                lng: newLng,
                isOpened: false,
                spawnedAt: Date.now(),
                city
            };
            
            playBoxDropSound();
            onSpawnBox(newBox);
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }, 100);
  };
  const handleRetry = (e: React.MouseEvent) => { e.stopPropagation(); if (!currentPosition) { alert("GPS 신호를 찾을 수 없습니다."); return; } if (coinBalance < 1) { alert("코인이 부족합니다."); return; } setCoinBalance(prev => prev - 1); onSpawnBox(null); setTimeout(() => { handleSearch({ bypassCost: true, minDist: 5, maxDist: 10 }); }, 50); };
  const handleClaim = () => { onAcquireBox(); };


  return (
    <div className="flex flex-col w-full h-full relative bg-gray-100">
      <MapContainer
        center={initialCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="flex-grow h-full"
        maxBounds={SOUTH_KOREA_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={7}
        zoomControl={false}
      >
        <ChangeView center={initialCenter} zoom={14} />
        {/* Changed to OpenStreetMap to debug potential tile server issues */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onMapClick={handleMapClick} isJammerMode={isJammerMode} />
        
        {/* Render Markers and Layers */}
        {currentPosition && <Marker position={[currentPosition.lat, currentPosition.lng]} icon={userIcon} />}
        {targetLocation && activeBox && <Marker position={[targetLocation.lat, targetLocation.lng]} icon={boxIcon} />}
        {pendingJammer && <Marker position={[pendingJammer.lat, pendingJammer.lng]} icon={pendingJammerIcon} zIndexOffset={2000} />}

        {exclusionZones.map(zone => {
          if (zone.geojson) {
            const isNK = zone.id === 'restricted-nk';
            const pathOptions = { color: isNK ? '#333333' : '#7C3AED', weight: 2, fillColor: isNK ? '#333333' : '#7C3AED', fillOpacity: 0.4, dashArray: isNK ? undefined : '5, 5' };
            return <GeoJSON key={zone.id} data={zone.geojson} pathOptions={pathOptions} />;
          } else {
            return <Circle key={zone.id} center={[zone.lat, zone.lng]} radius={zone.radius * 1000} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.2, weight: 1, dashArray: '5, 5' }} />;
          }
        })}
        
      </MapContainer>

      {/* --- Overlays --- */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-20">
          {/* UI elements like top bar, buttons etc. */}
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-gray-200 shadow-xl text-gray-800 pointer-events-auto flex justify-between items-center relative">
             <div className="absolute top-1 left-2 text-[8px] text-gray-400 font-mono font-bold">Ver 5.2 (React-Leaflet)</div>
             <div className="mt-2">
                 <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Operation Area</div>
                 <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    {currentCityName || "신호 대기 중..."}
                 </div>
             </div>
             <div className="text-right flex gap-3 items-center mt-2">
                 <button onClick={() => setIsTestMode(!isTestMode)} className="text-xl opacity-50 hover:opacity-100 transition-opacity">🛠️</button>
                 <div className="bg-brand-50 px-3 py-1 rounded-lg border border-brand-100 shadow-sm">
                    <div className="text-[9px] text-brand-600 font-bold uppercase">Coins</div>
                    <div className="font-black text-xl text-brand-600 tabular-nums">{coinBalance}</div>
                 </div>
             </div>
          </div>
          <div className="mt-2 flex gap-1 flex-wrap justify-end pointer-events-auto items-center">
              <button onClick={() => { setIsJammerMode(!isJammerMode); if(isJammerMode) setPendingJammer(null); }} className={`px-3 py-1.5 rounded-lg shadow-sm font-bold flex items-center gap-1 transition-colors text-[10px] ${isJammerMode ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-red-500 border border-red-200'}`}>
                {isJammerMode ? '🚫 설치 종료 (취소)' : '📡 수동 설치'}
              </button>
              <button onClick={() => setShowZoneModal(true)} className="bg-purple-600 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-sm font-bold flex items-center gap-1 hover:bg-purple-700 transition-colors ml-auto">
                🚫 차단 구역 관리 ({exclusionZones.filter(z => z.id !== 'restricted-nk').length})
              </button>
          </div>
          {isJammerMode && !pendingJammer && ( <div className="mt-2 flex justify-center animate-drop-in"> {isResolvingAddress ? ( <div className="bg-blue-600/90 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2"> <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 위치 확인 중... </div> ) : ( <div className="bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl border border-white/20 flex items-center gap-2"> <span className="text-lg animate-bounce">👇</span> 지도의 원하는 지점을 클릭하여 설치하세요 </div> )} </div>)}
          {isTestMode && ( <div className="mt-2 bg-yellow-100/95 p-3 rounded-xl pointer-events-auto text-xs grid grid-cols-2 gap-2 border border-yellow-200 shadow-md"> <button onClick={() => { onTeleport(37.5665, 126.9780, "서울"); setCurrentCityName("서울"); }} className="bg-white hover:bg-gray-50 p-2 rounded text-gray-800 font-bold border border-gray-200 shadow-sm">📍 서울 워프</button> <button onClick={() => { onTeleport(37.658, 126.3, "강화군"); setCurrentCityName("강화군"); }} className="bg-white hover:bg-gray-50 p-2 rounded text-gray-800 font-bold border border-gray-200 shadow-sm">📍 강화군 워프</button> <button onClick={() => setCoinBalance(prev => prev + 10)} className="bg-green-100 hover:bg-green-200 p-2 rounded text-green-700 font-bold border border-green-200 shadow-sm">💰 코인 +10</button> <button onClick={() => setExclusionZones(prev => prev.filter(z => z.id === 'restricted-nk'))} className="bg-red-100 hover:bg-red-200 p-2 rounded text-red-700 font-bold border border-red-200 shadow-sm">🗑️ 재머 삭제</button> </div> )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none z-20 pb-safe">
        {/* UI elements like scanner control etc. */}
        {loading ? ( <div className="bg-white/90 backdrop-blur p-6 rounded-2xl text-center font-mono animate-pulse pointer-events-auto border border-blue-200 shadow-2xl"> <div className="text-blue-600 font-bold text-lg mb-1">{loadingText}</div> <div className="w-full bg-gray-200 h-1 mt-3 overflow-hidden rounded-full"> <div className="h-full bg-blue-500 w-1/2 animate-[glint_1s_infinite]"></div> </div> </div> ) : pendingJammer ? ( <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-purple-500 pointer-events-auto animate-drop-in shadow-2xl"> <div className="flex items-start gap-3 mb-4"> <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl shrink-0">📍</div> <div> <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">설치 위치 확인</h2> <div className="text-lg font-black text-gray-800 leading-tight"> {pendingJammer.name} </div> </div> </div> <div className="flex gap-2"> <button onClick={() => setPendingJammer(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"> 취소 </button> <button onClick={confirmJammerPlacement} className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2"> <span>📡 재머 설치 (5km)</span> </button> </div> </div> ) : targetLocation ? ( <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border-2 border-green-500 pointer-events-auto animate-drop-in shadow-2xl"> <div className="flex justify-between items-start mb-4"> <div> <h2 className="text-xl font-black text-green-600 mb-1">📦 타겟 발견!</h2> <div className="text-gray-800 text-lg font-bold"> <span className="text-blue-600">{targetLocation.direction}</span> 쪽 <span className="text-blue-600">{targetLocation.dist}km</span> 지점 </div> </div> </div> <div className="flex flex-col gap-2"> <div className="grid grid-cols-2 gap-2"> <button onClick={handleOpenNaverMap} className="py-3 bg-[#03C75A] text-white rounded-xl font-bold shadow-sm hover:bg-[#02b350] transition-colors flex items-center justify-center gap-1"> <span className="font-black">N</span> 길찾기 </button> <button onClick={handleOpenKakaoMap} className="py-3 bg-[#FEE500] text-black rounded-xl font-bold shadow-sm hover:bg-[#E6CF00] transition-colors flex items-center justify-center gap-1"> <span className="font-black">K</span> 길찾기 </button> <button onClick={handleRetry} className="py-3 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 transition-colors flex flex-col items-center justify-center leading-tight border border-orange-200"> <span className="text-sm">🔄 다시 하기</span> <span className="text-[10px] font-normal opacity-80">코인 1개 소모</span> </button> <button onClick={() => onSpawnBox(null)} className="py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors text-xs flex flex-col items-center justify-center leading-tight"> <span className="text-sm">🌊 무효</span> <span className="text-[10px] font-normal scale-90">바다/불가</span> </button> </div> {isTestMode && <button onClick={handleDevWarp} className="w-full py-2 bg-purple-100 text-purple-600 text-xs rounded-xl font-bold border border-purple-200 mt-1">WARP (DEV)</button>} <button onClick={handleClaim} disabled={targetLocation.dist > 0.3 && !isTestMode} className={`w-full py-3 rounded-xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 ${targetLocation.dist <= 0.3 || isTestMode ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}> {targetLocation.dist <= 0.3 || isTestMode ? '🖐️ 확보 하기 (즉시)' : `🏃 ${Math.max(0, targetLocation.dist - 0.3).toFixed(1)}km 더 이동하세요 (300m 이내)`} </button> </div> </div> ) : ( <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200 pointer-events-auto shadow-2xl"> <div className="text-[10px] text-gray-500 mb-3 text-center uppercase tracking-[0.2em] font-bold">Scanner Control</div> <div className="grid grid-cols-5 gap-1.5 mb-4"> {['W', 'N', 'ALL', 'S', 'E'].map(dir => ( <button key={dir} onClick={() => setScanDirection(dir)} className={`p-2 rounded-lg font-bold text-xs transition-all ${ scanDirection === dir ? (dir === 'ALL' ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg scale-105 z-10' : 'bg-yellow-400 text-black ring-2 ring-yellow-200 shadow-lg scale-105 z-10') : 'bg-gray-100 text-gray-400 hover:bg-gray-200' }`}> {dir} </button>))} </div> <button onClick={() => handleSearch({ minDist: 5, maxDist: 10 })} className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 relative overflow-hidden group ${scanDirection === 'ALL' ? 'bg-blue-600 border-blue-800 hover:bg-blue-500 text-white' : 'bg-yellow-400 border-yellow-600 hover:bg-yellow-300 text-black'}`}> <span className="relative z-10">{scanDirection === 'ALL' ? '📡 광역 스캔 (5~10km)' : `🎯 정밀 탐색 (코인 -1)`}</span> <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div> </button> </div> )}
      </div>

      {showZoneModal && (
        <div className="absolute inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 pointer-events-auto backdrop-blur-sm animate-pop">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl flex-shrink-0">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2"> <span className="text-xl">🚫</span> 차단 구역 관리 </h3>
                 <button onClick={()=>setShowZoneModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">✕</button>
              </div>
              <div className="p-4 bg-white flex-shrink-0 border-b border-gray-100">
                 {isZoneSearching && modalLoadingText && ( <div className="mb-2 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-2 rounded-lg animate-pulse border border-blue-100 text-center"> ⏳ {modalLoadingText} </div> )}
                 <div className="text-xs text-gray-500 mb-2">
                    원하는 지역을 체크하면 지도에서 자동으로 차단됩니다.<br/>
                    <span className="text-purple-600 font-bold">* 체크 시 서버에서 경계 데이터를 불러옵니다.</span>
                 </div>
                 <div className="flex gap-2">
                    <input 
                       value={zoneSearchText}
                       onChange={(e)=>setZoneSearchText(e.target.value)}
                       placeholder="직접 입력 (예: 독도)"
                       className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 shadow-inner"
                       onKeyDown={(e) => {
                           if (e.nativeEvent.isComposing) return;
                           if (e.key === 'Enter') handleAddManualZone();
                       }}
                    />
                    <button 
                       onClick={() => handleAddManualZone()}
                       disabled={isZoneSearching || !zoneSearchText.trim()}
                       className="px-3 bg-gray-800 text-white rounded-lg text-sm font-bold whitespace-nowrap disabled:opacity-50"
                    >
                       {isZoneSearching ? '...' : '추가'}
                    </button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0 relative">
                 {Object.entries(KOREA_ADMIN_DIVISIONS).map(([prov, cities]) => {
                   const activeInProvince = exclusionZones.filter(z => cities.includes(z.name));
                   const allActive = activeInProvince.length >= cities.length;
                   
                   return (
                   <div key={prov} className="mb-6">
                     <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 py-2 mb-2 flex items-center justify-between border-b border-gray-200">
                       <div className="flex items-center gap-2">
                           <span className="w-2 h-4 bg-purple-500 rounded-full"></span>
                           <h4 className="font-bold text-gray-800 text-sm">{prov}</h4>
                           <span className="text-[10px] text-gray-400 font-bold">({cities.length})</span>
                       </div>
                       <button 
                         onClick={() => handleToggleProvince(prov, cities)}
                         disabled={isZoneSearching}
                         className={`text-[10px] px-2 py-1 rounded border font-bold transition-all ${allActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                       >
                         {allActive ? '전체 해제' : '전체 선택'}
                       </button>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                       {cities.map(city => {
                          const isAdded = exclusionZones.some(z => z.name === city || z.name === `${city} (${prov})`);
                          return (
                             <button 
                                key={city}
                                onClick={() => handleToggleCity(city, prov)}
                                disabled={isZoneSearching}
                                className={`
                                  py-2.5 px-1 rounded-lg text-[11px] font-bold border transition-all relative overflow-hidden
                                  ${isAdded 
                                    ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-inner' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 shadow-sm'
                                  }
                                `}
                             >
                                {isAdded && <span className="absolute top-0.5 right-1 text-[8px]">✔</span>}
                                {city}
                             </button>
                          )
                       })}
                     </div>
                   </div>
                 )})
              }
              </div>

              <div className="p-3 bg-gray-100 border-t border-gray-200 flex-shrink-0">
                  <div className="text-[10px] text-gray-500 text-center mb-2">
                    현재 차단된 구역: <b>{exclusionZones.filter(z => z.id !== 'restricted-nk').length}</b>곳
                  </div>
                  {exclusionZones.filter(z => z.id !== 'restricted-nk').length > 0 && (
                     <div className="flex flex-col gap-1 max-h-24 overflow-y-auto pr-1">
                        {exclusionZones.filter(z => z.id !== 'restricted-nk').map(z => (
                           <div key={z.id} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs">
                              <span className="font-bold text-gray-700">{z.name}</span>
                              <button onClick={() => removeZone(z.id)} className="text-red-500 hover:text-red-700 px-2 font-bold">삭제</button>
                           </div>
                        ))}
                     </div>
                  )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MapMode;