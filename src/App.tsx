import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import L from 'leaflet';

// 마커 아이콘 깨짐 방지 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 지도를 이동시키는 내부 컴포넌트
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

function App() {
  const [position, setPosition] = useState<[number, number]>([37.5665, 126.9780]); // 기본 서울

  const moveRandomly = () => {
    // 한국 본토 대략적인 위경도 범위
    const lat = 35.0 + Math.random() * 3.0; 
    const lng = 126.5 + Math.random() * 2.5;
    setPosition([lat, lng]);
  };

  return (
    <div className="relative w-full h-screen">
      {/* UI 레이어 */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xs px-4">
        <button 
          onClick={moveRandomly}
          className="w-full bg-black text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform border border-white/20"
        >
          <Navigation size={24} className="animate-pulse" />
          <span className="text-lg">어디로 갈까?</span>
        </button>
      </div>
      
      {/* 지도 레이어 */}
      <MapContainer center={position} zoom={13} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
}

export default App;
