
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MapTrackerProps {
  position: { lat: number; lng: number } | null;
  className?: string;
  mapHeightClass?: string;
}

// Simple internal retry function for search fetching
const simpleFetchWithRetry = async (url: string, retries = 2, delay = 800) => {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                 if(res.status >= 500 || res.status === 429) {
                     await new Promise(r => setTimeout(r, delay * (i + 1)));
                     continue;
                 }
                 throw new Error(`HTTP ${res.status}`);
            }
            return await res.json();
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, delay * (i + 1)));
        }
    }
    return null;
};

const MapTracker: React.FC<MapTrackerProps> = ({ position, className = "", mapHeightClass = "h-80" }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  
  // Navigation Refs
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  
  // Track path history locally for drawing the route line
  const [pathHistory, setPathHistory] = useState<L.LatLngExpression[]>([]);
  const [isFollowing, setIsFollowing] = useState(true);

  // Search & Navigation State
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Default to Seoul if no position yet
      const initialLat = position ? position.lat : 37.5665;
      const initialLng = position ? position.lng : 126.9780;

      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false, 
        attributionControl: true,
        maxZoom: 18, 
        minZoom: 6
      }).setView([initialLat, initialLng], 15); // Default Zoom slightly lower to ensure tiles load

      // Define Base Layers
      // 1. Carto Voyager: Cleanest, fastest, best for general navigation
      const cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; CARTO',
        detectRetina: true
      });

      // 2. OSM Standard
      const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
        detectRetina: true
      });

      // 3. CyclOSM
      const cyclOSM = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: 'CyclOSM | OSM contributors',
        detectRetina: true
      });

      // Set Default Layer (Carto is most reliable)
      cartoVoyager.addTo(mapInstanceRef.current);

      // Add Layer Control
      const baseMaps = {
        "깔끔한 지도 (Carto)": cartoVoyager,
        "일반 지도 (Standard)": osmStandard,
        "자전거 지도 (CyclOSM)": cyclOSM,
      };
      
      L.control.layers(baseMaps, undefined, { position: 'bottomleft' }).addTo(mapInstanceRef.current);

      // Initialize Traveled Polyline (Red)
      polylineRef.current = L.polyline([], {
        color: '#ea580c', // Orange-600
        weight: 6,
        opacity: 0.8,
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      // Add Zoom Control
      L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);

      // Manual drag detection
      mapInstanceRef.current.on('dragstart', () => {
        setIsFollowing(false);
      });

      // FIX: Gray map issue - Invalidate size after a short delay to ensure container is rendered
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Position & Draw Traveled Path
  useEffect(() => {
    if (!position || !mapInstanceRef.current) return;

    const { lat, lng } = position;
    const newLatLng = new L.LatLng(lat, lng);

    // 1. Update Path History
    setPathHistory(prev => {
      const newPath = [...prev, newLatLng];
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(newPath);
      }
      return newPath;
    });

    // 2. Update Bike Marker
    const bikeIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-full h-full">
           <div class="absolute w-full h-full bg-brand-500 rounded-full opacity-30 animate-ping"></div>
           <div style="
              background-color: #ea580c; 
              width: 36px; 
              height: 36px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              z-index: 10;
              position: relative;
            ">
              🚲
            </div>
            <div class="absolute -bottom-1 w-2 h-2 bg-black rotate-45"></div>
        </div>
      `,
      className: 'custom-bike-nav-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 44],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng(newLatLng);
      markerRef.current.setIcon(bikeIcon);
      markerRef.current.setZIndexOffset(1000);
    } else {
      markerRef.current = L.marker(newLatLng, { icon: bikeIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
    }

    // 3. Pan Map (if following)
    if (isFollowing) {
      mapInstanceRef.current.panTo(newLatLng, { animate: true, duration: 0.5 });
    }

  }, [position, isFollowing]);

  const handleRecenter = () => {
    if (position && mapInstanceRef.current) {
      mapInstanceRef.current.setView([position.lat, position.lng], 16, { animate: true });
      setIsFollowing(true);
      // Fix gray map again just in case
      mapInstanceRef.current.invalidateSize();
    }
  };

  // -- Navigation Functions --

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    
    // Guard: Map not ready
    if (!mapInstanceRef.current) {
      alert("지도가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSearching(true);
    try {
      // 1. Search Location (Nominatim)
      // Use simpleFetchWithRetry to avoid "Failed to fetch" on first failure
      const searchData = await simpleFetchWithRetry(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&accept-language=ko&countrycodes=kr`
      );

      if (searchData && searchData.length > 0) {
        const target = searchData[0];
        const destLat = parseFloat(target.lat);
        const destLon = parseFloat(target.lon);

        // Remove old marker/route
        if (destMarkerRef.current) destMarkerRef.current.remove();
        if (routeLineRef.current) routeLineRef.current.remove();

        // Add Destination Marker
        const destIcon = L.divIcon({
          html: '<div style="font-size:32px; filter: drop-shadow(0 3px 3px rgba(0,0,0,0.4));">🏁</div>',
          className: 'dest-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 30]
        });
        destMarkerRef.current = L.marker([destLat, destLon], { icon: destIcon }).addTo(mapInstanceRef.current);

        // Map Bounds Fitting (Start & End)
        if (position) {
          const bounds = L.latLngBounds([
            [position.lat, position.lng],
            [destLat, destLon]
          ]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
          setIsFollowing(false);
        } else {
          mapInstanceRef.current.setView([destLat, destLon], 15);
        }

        // 2. Calculate Route (OSRM)
        if (position) {
          // Fallback function: Straight Line
          const drawStraightLine = () => {
            if (!mapInstanceRef.current) return;
            
            const points: [number, number][] = [
              [position.lat, position.lng],
              [destLat, destLon]
            ];

            // Remove existing line first
            if (routeLineRef.current) routeLineRef.current.remove();

            routeLineRef.current = L.polyline(points, {
              color: '#ef4444', // Red-500
              weight: 5,
              opacity: 0.8,
              dashArray: '10, 15', // Dotted line
              lineCap: 'round'
            }).addTo(mapInstanceRef.current);

            // Calculate direct distance
            const R = 6371e3; // metres
            const φ1 = position.lat * Math.PI/180;
            const φ2 = destLat * Math.PI/180;
            const Δφ = (destLat-position.lat) * Math.PI/180;
            const Δλ = (destLon-position.lng) * Math.PI/180;
            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                      Math.cos(φ1) * Math.cos(φ2) *
                      Math.sin(Δλ/2) * Math.sin(Δλ/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const dist = R * c;

            setRouteInfo({
              distance: dist,
              duration: dist / 4 // Approx 4m/s bike speed
            });
          };

          const routeUrl = `https://router.project-osrm.org/route/v1/bicycle/${position.lng},${position.lat};${destLon},${destLat}?overview=full&geometries=geojson`;
          
          try {
            // Also retry for OSRM
            const routeData = await simpleFetchWithRetry(routeUrl);

            if (routeData && routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
              const route = routeData.routes[0];
              const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);

              // Draw Route (Blue Solid)
              if (routeLineRef.current) routeLineRef.current.remove();
              
              routeLineRef.current = L.polyline(coords, {
                color: '#3b82f6', // Blue-500
                weight: 6,
                opacity: 0.9,
                lineJoin: 'round'
              }).addTo(mapInstanceRef.current);

              setRouteInfo({
                distance: route.distance,
                duration: route.duration
              });
            } else {
              // OSRM failed -> Fallback
              console.warn("OSRM No Route found, using straight line.");
              drawStraightLine();
            }
          } catch (routeErr) {
            console.error("OSRM Error:", routeErr);
            drawStraightLine();
          }
        } else {
          alert("GPS 신호를 기다리는 중입니다. 위치가 잡히면 경로가 계산됩니다.");
        }
      } else {
        alert("장소를 찾을 수 없습니다. 정확한 지명을 입력해주세요.");
      }
    } catch (e) {
      console.error("Navigation Error:", e);
      alert("검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearNavigation = () => {
    if (destMarkerRef.current) destMarkerRef.current.remove();
    if (routeLineRef.current) routeLineRef.current.remove();
    destMarkerRef.current = null;
    routeLineRef.current = null;
    setRouteInfo(null);
    setSearchText('');
    handleRecenter();
  };

  return (
    <div className={`flex flex-col gap-3 w-full h-full animate-pop ${className}`}>
      
      {/* 1. Search Bar Area */}
      <form onSubmit={handleSearch} className="flex gap-2 w-full flex-shrink-0 z-10">
         <div className="relative flex-1">
           <input 
             type="text" 
             value={searchText}
             onChange={(e) => setSearchText(e.target.value)}
             placeholder="목적지 검색 (예: 한강공원)"
             className="w-full pl-4 pr-10 py-3 rounded-xl border-2 border-gray-300 text-gray-900 bg-white font-bold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-sm text-sm transition-all"
           />
           {searchText && (
             <button 
               type="button" 
               onClick={() => setSearchText('')}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
             >
               ✕
             </button>
           )}
         </div>
         <button 
           type="submit"
           disabled={isSearching}
           className="bg-brand-600 text-white px-4 py-3 rounded-xl font-black shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors whitespace-nowrap text-sm"
         >
           {isSearching ? '...' : '검색'}
         </button>
      </form>

      {/* 2. Route Info Panel */}
      {routeInfo && (
        <div className="flex justify-between items-center bg-blue-50 border-2 border-blue-200 p-3 rounded-xl shadow-sm animate-drop-in flex-shrink-0 z-10">
          <div className="flex gap-4 items-center">
            <div>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">남은 거리</span>
              <span className="text-lg font-black text-gray-800 leading-none">
                {(routeInfo.distance / 1000).toFixed(1)} <span className="text-xs font-normal text-gray-500">km</span>
              </span>
            </div>
            <div className="w-px h-6 bg-blue-200"></div>
            <div>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">예상 시간</span>
              <span className="text-lg font-black text-gray-800 leading-none">
                {Math.ceil(routeInfo.duration / 60)} <span className="text-xs font-normal text-gray-500">분</span>
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={clearNavigation}
            className="bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 px-3 py-2 rounded-lg border border-gray-200 font-bold text-xs shadow-sm transition-all"
          >
            종료
          </button>
        </div>
      )}

      {/* 3. Map Container */}
      <div className={`relative w-full rounded-2xl overflow-hidden border-2 border-gray-300 shadow-md bg-gray-100 flex-1 ${mapHeightClass}`}>
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-gray-200" />
        
        {/* Loading Overlay */}
        {!position && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 z-[1000]">
            <div className="flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-xs text-gray-600 font-bold animate-pulse">GPS 신호 수신 중...</span>
            </div>
          </div>
        )}

        {/* Floating Recenter Button */}
        <div className="absolute bottom-4 right-4 z-[400]">
           <button 
             type="button"
             onClick={handleRecenter}
             className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all border-2 border-white/50 ${isFollowing ? 'bg-brand-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
             title="내 위치로 이동"
           >
             {isFollowing ? (
               <span className="text-lg">📍</span>
             ) : (
               <span className="text-lg animate-bounce">🎯</span>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default MapTracker;
