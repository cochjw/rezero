import { useState, useEffect, useRef, useCallback } from 'react';
import './index.css'; // 디자인을 위해 반드시 필요함
import { DEFAULT_INGREDIENTS, DEFAULT_EQUIPMENT, INITIAL_CATEGORIES, EQUIPMENT_CATEGORIES } from './constants';
import { Ingredient, StoredIngredient, LogEntry, GachaSelection, EquipmentBox, ExclusionZone } from './types';
import GachaMachine from './components/GachaMachine';
import IngredientManager from './components/IngredientManager';
import Warehouse from './components/Warehouse';
import RecipeResult from './components/RecipeResult';
import HistoryLog from './components/HistoryLog';
import MapMode from './components/MapMode';
import { initAudio, playClickSound, playShakingSound, playCoinSound, playPaymentSound, playMiningRewardSound, playSlotLandSound } from './utils/sound';
import { calculateDistance } from './utils/geo';

function App() {
  const [activeTab, setActiveTab] = useState<'gacha' | 'warehouse' | 'settings' | 'history' | 'explore'>('gacha');
  const [gachaMode, setGachaMode] = useState<'food' | 'equipment'>('food');

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_autosave');
      return saved ? JSON.parse(saved).ingredients : DEFAULT_INGREDIENTS;
    } catch (e) { return DEFAULT_INGREDIENTS; }
  });

  const [equipment, setEquipment] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_autosave_equip');
      return saved ? JSON.parse(saved).equipment : DEFAULT_EQUIPMENT;
    } catch (e) { return DEFAULT_EQUIPMENT; }
  });

  const [myIngredients, setMyIngredients] = useState<StoredIngredient[]>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_warehouse');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [activeBoxOnMap, setActiveBoxOnMap] = useState<EquipmentBox | null>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_map_box');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [exclusionZones, setExclusionZones] = useState<ExclusionZone[]>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_zones');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [boxCount, setBoxCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_box_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) { return 0; }
  });

  const [visitedCities, setVisitedCities] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_visited_cities');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [currentCity, setCurrentCity] = useState<string | null>(null);
  
  const [coinBalance, setCoinBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_coins');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) { return 0; }
  });

  const [goldBalance, setGoldBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_gold');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) { return 0; }
  });

  const [currentDistance, setCurrentDistance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_distance');
      return saved ? parseFloat(saved) : 0;
    } catch (e) { return 0; }
  });

  const [isTracking, setIsTracking] = useState(false);
  
  const [currentPosition, setCurrentPosition] = useState<{lat: number, lng: number} | null>(() => {
    try {
      const saved = localStorage.getItem('sikjaeryo_last_pos');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<GachaSelection[] | null>(null);
  const [pendingResult, setPendingResult] = useState<GachaSelection[] | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<{lat: number, lon: number} | null>(currentPosition ? {lat: currentPosition.lat, lon: currentPosition.lng} : null);
  const lastGPSUpdateTime = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem('sikjaeryo_coins', coinBalance.toString());
    localStorage.setItem('sikjaeryo_gold', goldBalance.toString());
    localStorage.setItem('sikjaeryo_distance', currentDistance.toString());
    localStorage.setItem('sikjaeryo_warehouse', JSON.stringify(myIngredients));
    localStorage.setItem('sikjaeryo_logs', JSON.stringify(logs));
    localStorage.setItem('sikjaeryo_map_box', JSON.stringify(activeBoxOnMap));
    localStorage.setItem('sikjaeryo_box_count', boxCount.toString());
    localStorage.setItem('sikjaeryo_visited_cities', JSON.stringify(visitedCities));
    localStorage.setItem('sikjaeryo_zones', JSON.stringify(exclusionZones));
  }, [coinBalance, goldBalance, currentDistance, myIngredients, logs, activeBoxOnMap, boxCount, visitedCities, exclusionZones]);

  useEffect(() => {
    if (currentPosition) {
      console.log("App.tsx: currentPosition updated:", currentPosition);
      localStorage.setItem('sikjaeryo_last_pos', JSON.stringify(currentPosition));
    } else {
      console.log("App.tsx: currentPosition is null.");
    }
  }, [currentPosition]);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 300));
  }, []);

  const handleRefreshGPS = useCallback(() => {
    const now = Date.now();
    if (now - lastGPSUpdateTime.current < 2000) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        lastGPSUpdateTime.current = Date.now();
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        lastPosRef.current = { lat: latitude, lon: longitude };
        addLog('system', '📍 위치 정보가 갱신되었습니다.');
      },
      (error) => {
        console.warn("GPS refresh failed:", error.message);
        addLog('system', '⚠️ 위치를 가져올 수 없습니다.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [addLog]);

  useEffect(() => {
    handleRefreshGPS();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const startTracking = () => {
    if (watchIdRef.current !== null) return;
    initAudio();
    setIsTracking(true);
    addLog('system', '🛰️ 라이딩 코인 채굴 시작 (GPS 활성화)');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const now = Date.now();
        if (now - lastGPSUpdateTime.current < 2000) return;
        lastGPSUpdateTime.current = now;

        let dist = 0;
        if (lastPosRef.current) {
          dist = calculateDistance(lastPosRef.current.lat, lastPosRef.current.lon, latitude, longitude);
        }

        if (!lastPosRef.current || dist > 0.01) {
             setCurrentPosition({ lat: latitude, lng: longitude });
             setCurrentSpeed(speed ? speed * 3.6 : 0);
             if (lastPosRef.current) {
                setCurrentDistance(prev => {
                    const newTotal = prev + dist;
                    if (Math.floor(newTotal / 10) > Math.floor(prev / 10)) {
                      setCoinBalance(c => c + 1);
                      playMiningRewardSound();
                      addLog('coin', `💰 10km 돌파! 코인 획득!`);
                    }
                    return newTotal;
                });
             }
             lastPosRef.current = { lat: latitude, lon: longitude };
        }
      },
      (error) => { console.warn("Tracking error:", error.message); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setCurrentSpeed(0);
    addLog('system', '🛰️ 채굴 종료');
  };

  const toggleTracking = () => {
    if (isTracking) stopTracking();
    else startTracking();
  };

  const handleAcquireBox = () => {
    if (!activeBoxOnMap) return;
    const targetCity = activeBoxOnMap.city || "알 수 없음";
    const newZone: ExclusionZone = {
        id: `acquired-${Date.now()}`,
        lat: activeBoxOnMap.lat,
        lng: activeBoxOnMap.lng,
        radius: 5,
        name: `획득 지점 (${targetCity})`,
        type: 'AUTO'
    };
    setExclusionZones(prev => [...prev, newZone]);
    setBoxCount(prev => prev + 1);
    setActiveBoxOnMap(null);
    playCoinSound();
    addLog('get', `📦 [${targetCity}] 보급품 획득 완료! (주변 5km 차단됨)`);
  };

  const handleRollMachine = () => {
    if (isRolling) return;
    initAudio();
    if (gachaMode === 'food') {
      if (coinBalance < 1) { addLog('system', '❌ 코인이 부족합니다.'); return; }
      setCoinBalance(prev => prev - 1);
      const pool = ingredients.filter(i => i.isActive);
      const selected = pool[Math.floor(Math.random() * pool.length)];
      setPendingResult([{ ingredient: selected, goldReward: Math.floor(Math.random() * 20) * 1000 }]);
    } else {
      if (boxCount < 1) { addLog('system', '❌ 상자가 없습니다.'); return; }
      setBoxCount(prev => prev - 1);
      const pool = equipment.filter(i => i.isActive);
      const selected = pool[Math.floor(Math.random() * pool.length)];
      setPendingResult([{ ingredient: selected, goldReward: Math.floor(Math.random() * 50) * 1000 }]);
    }
    setIsRolling(true);
    playShakingSound();
  };

  const handleStopMachine = () => {
    if (!isRolling) return;
    setIsRolling(false);
    playSlotLandSound();
    setTimeout(() => {
      setLastResult(pendingResult);
      setPendingResult(null);
    }, 1000);
  };

  const handleGachaComplete = (selectedItem: Ingredient, goldReward: number = 0) => {
    const newStoredItem: StoredIngredient = {
      ...selectedItem,
      instanceId: `inst-${Date.now()}`,
      storedAt: Date.now(),
      isUsed: false,
      canSynthesize: Math.random() < 0.5
    };
    setMyIngredients(prev => [newStoredItem, ...prev]);
    if (goldReward > 0) setGoldBalance(prev => prev + goldReward);
    setLastResult(null); 
    const rewardText = goldReward > 0 ? ` (+${goldReward.toLocaleString()}원)` : '';
    addLog('gacha', `🎰 획득: [${selectedItem.tier || 3}⭐] ${selectedItem.name}${rewardText}`);
  };

  const handleAddVisitedCity = (city: string) => {
    if (!city) return;
    if (!visitedCities.includes(city)) {
      setVisitedCities(prev => [city, ...prev]);
      addLog('system', `🚩 도시 점령: [${city}] 지역을 확보했습니다.`);
    }
  };

  const handleRemoveVisitedCity = (city: string) => {
    setVisitedCities(prev => prev.filter(c => c !== city));
    addLog('system', `♻️ 점령 취소: [${city}]에서 다시 탐색이 가능합니다.`);
  };

  const teleport = (lat: number, lng: number, name: string) => {
    setCurrentPosition({ lat, lng });
    lastPosRef.current = { lat, lon: lng };
    playClickSound();
    addLog('system', `🚀 순간이동: ${name} (으)로 이동했습니다.`);
  };

  return (
    <div className="min-h-[100dvh] bg-brand-50 font-sans text-gray-800 flex flex-col max-w-md mx-auto shadow-2xl relative overflow-y-auto">
      <header className="p-4 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
        <h1 className="text-xl font-black text-brand-600 tracking-tight flex items-center gap-2">🍎 식재료 가챠</h1>
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-bold px-2 py-0.5 bg-brand-100 text-brand-700 rounded-lg shadow-sm">
            📍 {currentCity || "위치 확인 중..."}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative pb-24">
        {activeTab === 'gacha' && (
          <GachaMachine 
            onRoll={handleRollMachine} onStopRoll={handleStopMachine}
            onToggleTracking={toggleTracking} onResetDistance={() => setCurrentDistance(0)}
            onDebugAddCoin={() => { setCoinBalance(prev => prev + 10); playCoinSound(); }} 
            onModeChange={setGachaMode} currentMode={gachaMode}
            isRolling={isRolling} isTracking={isTracking} 
            poolSize={gachaMode === 'food' ? ingredients.filter(i => i.isActive).length : equipment.filter(i => i.isActive).length}
            coinBalance={coinBalance} goldBalance={goldBalance}
            boxCount={boxCount} currentDistance={currentDistance} 
            accumulatedElevation={0} currentPosition={currentPosition} 
            currentSpeed={currentSpeed} ingredients={gachaMode === 'food' ? ingredients : equipment} 
          />
        )}
        {activeTab === 'explore' && (
          <MapMode 
            currentPosition={currentPosition} activeBox={activeBoxOnMap}
            visitedCities={visitedCities}
            onSpawnBox={(box) => { setActiveBoxOnMap(box); if (box) addLog('scan', `📡 탐색 성공: [${box.city}] 보급품 발견!`); }}
            onAcquireBox={handleAcquireBox} onTeleport={(lat, lng) => teleport(lat, lng, "목표 지점")}
            onRefreshGPS={handleRefreshGPS} onAddVisitedCity={handleAddVisitedCity}
            onRemoveVisitedCity={handleRemoveVisitedCity} setCurrentCityName={setCurrentCity}
            currentCityName={currentCity} exclusionZones={exclusionZones}
            setExclusionZones={setExclusionZones} coinBalance={coinBalance} setCoinBalance={setCoinBalance}
          />
        )}
        {activeTab === 'warehouse' && (
          <Warehouse 
            items={myIngredients} ingredientsPool={ingredients} 
            equipmentPool={equipment} goldBalance={goldBalance}
            onUseItem={(id, amt) => {
               setMyIngredients(prev => prev.map(i => i.instanceId === id ? { ...i, isUsed: true, spentAmount: amt } : i));
               setGoldBalance(prev => prev - amt);
               playPaymentSound();
            }}
            onClearAll={() => setMyIngredients([])} onReorder={setMyIngredients} 
            onSynthesize={(id1, id2) => {
              setMyIngredients(prev => prev.filter(i => i.instanceId !== id1 && i.instanceId !== id2));
              setGoldBalance(prev => prev - 1000);
            }} 
            onSynthesisComplete={(item) => handleGachaComplete(item, 0)}
            onNavigateToGacha={() => setActiveTab('gacha')}
          />
        )}
        {activeTab === 'history' && <HistoryLog logs={logs} onClearLogs={() => setLogs([])} onNavigateToGacha={() => setActiveTab('gacha')} />}
        {activeTab === 'settings' && (
          <IngredientManager 
            foodIngredients={ingredients} foodCategories={INITIAL_CATEGORIES}
            onAddFood={(n, c, t) => setIngredients([...ingredients, {id:`c-${Date.now()}`,name:n,category:c,tier:t,isCustom:true,isActive:true}])}
            onRemoveFood={id => setIngredients(ingredients.filter(i => i.id !== id))} 
            onUpdateFood={(id,u) => setIngredients(ingredients.map(i => i.id===id?{...i,...u}:i))}
            onAddFoodCategory={() => {}} onRemoveFoodCategory={() => {}}
            equipIngredients={equipment} equipCategories={EQUIPMENT_CATEGORIES}
            onAddEquip={(n, c, t) => setEquipment([...equipment, {id:`e-${Date.now()}`,name:n,category:c,tier:t,isCustom:true,isActive:true}])}
            onRemoveEquip={id => setEquipment(equipment.filter(i => i.id !== id))}
            onUpdateEquip={(id,u) => setEquipment(equipment.map(i => i.id===id?{...i,...u}:i))}
            onAddEquipCategory={() => {}} onRemoveEquipCategory={() => {}}
            onNavigateToGacha={() => setActiveTab('gacha')} onOpenSaveModal={() => {}}
          />
        )}
      </main>

      <nav className="bg-white border-t border-gray-100 p-2 flex justify-around z-30 pb-safe fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md">
        <button onClick={() => setActiveTab('gacha')} className={`flex flex-col items-center p-2 rounded-xl flex-1 ${activeTab==='gacha'?'text-brand-600 bg-brand-50':'text-gray-400'}`}>
          <span className="text-2xl mb-0.5">🎰</span><span className="text-[10px] font-bold">뽑기</span>
        </button>
        <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center p-2 rounded-xl flex-1 ${activeTab==='explore'?'text-brand-600 bg-brand-50':'text-gray-400'}`}>
          <span className="text-2xl mb-0.5">🛰️</span><span className="text-[10px] font-bold">탐색</span>
        </button>
        <button onClick={() => setActiveTab('warehouse')} className={`relative flex flex-col items-center p-2 rounded-xl flex-1 ${activeTab==='warehouse'?'text-brand-600 bg-brand-50':'text-gray-400'}`}>
          <span className="text-2xl mb-0.5">🎒</span><span className="text-[10px] font-bold">가방</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center p-2 rounded-xl flex-1 ${activeTab==='history'?'text-brand-600 bg-brand-50':'text-gray-400'}`}>
          <span className="text-2xl mb-0.5">📜</span><span className="text-[10px] font-bold">기록</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 rounded-xl flex-1 ${activeTab==='settings'?'text-brand-600 bg-brand-50':'text-gray-400'}`}>
          <span className="text-2xl mb-0.5">⚙️</span><span className="text-[10px] font-bold">설정</span>
        </button>
      </nav>

      {lastResult && (
        <RecipeResult selections={lastResult} onClose={() => setLastResult(null)} onComplete={handleGachaComplete} />
      )}
    </div>
  );
}

export default App;