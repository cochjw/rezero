
import React, { useState, useEffect, useRef } from 'react';
import { Ingredient } from '../types';
import { playSlotTickSound, stopShakingSound, playShakingSound } from '../utils/sound';

interface GachaMachineProps {
  onRoll: () => void;
  onStopRoll: () => void; 
  onToggleTracking: () => void;
  onResetDistance: () => void;
  onDebugAddCoin: () => void;
  onModeChange: (mode: 'food' | 'equipment') => void;
  currentMode: 'food' | 'equipment';
  isRolling: boolean;
  isTracking: boolean;
  poolSize: number;
  coinBalance: number;
  goldBalance: number;
  boxCount: number;
  currentDistance: number;
  accumulatedElevation: number;
  currentPosition: { lat: number; lng: number } | null;
  currentSpeed: number; 
  ingredients: Ingredient[];
}

const GachaMachine: React.FC<GachaMachineProps> = ({ 
  onRoll, onStopRoll, onToggleTracking, onResetDistance, onDebugAddCoin, onModeChange, currentMode,
  isRolling, isTracking, poolSize, coinBalance, goldBalance, boxCount, currentDistance, ingredients
}) => {
  const [shufflingName, setShufflingName] = useState<string>('');
  const [showQuestionMark, setShowQuestionMark] = useState(false);
  const shuffleIntervalRef = useRef<number | null>(null);
  
  // Track previous rolling state to prevent animation on tab switch
  const prevIsRolling = useRef(isRolling);

  useEffect(() => {
    if (isRolling) {
      setShowQuestionMark(false);
      const activePool = ingredients.filter(i => i.isActive);
      if (activePool.length > 0) {
        // Clear previous interval if it exists (e.g. ingredients changed while rolling)
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);

        // Slow down visual updates to 150ms for better mobile performance
        shuffleIntervalRef.current = window.setInterval(() => {
          const randomIndex = Math.floor(Math.random() * activePool.length);
          setShufflingName(activePool[randomIndex].name);
          playSlotTickSound();
        }, 150); 
      }
    } else {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
      
      // Only show question mark if we were PREVIOUSLY rolling (true -> false transition)
      if (prevIsRolling.current && shufflingName) {
        setShowQuestionMark(true);
        // Do not call playShakingSound here as it is handled once on start in App.tsx
        // Just manage the question mark visual state
        setTimeout(() => {
          setShowQuestionMark(false);
          stopShakingSound();
          setShufflingName(''); // Clear state to prevent ghosts
        }, 1000);
      } else if (!prevIsRolling.current) {
        // Ensure clean state if we weren't rolling (e.g. tab switch)
        setShowQuestionMark(false);
        setShufflingName('');
      }
    }
    
    prevIsRolling.current = isRolling;

    return () => { if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current); };
  }, [isRolling, ingredients]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full relative overflow-hidden bg-white">
      {/* 재화 상단 바 - 위치 및 크기 고정 */}
      <div className="absolute top-4 left-0 right-0 px-6 z-20 flex justify-end items-center gap-2">
        <div className="bg-white/95 backdrop-blur shadow-lg border rounded-full h-10 pl-2 pr-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center font-black text-white text-[10px]">₩</div>
          <span className="font-black text-xs text-gray-800">{goldBalance.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="bg-white/95 backdrop-blur shadow-lg border border-brand-200 rounded-full h-10 pl-2 pr-4 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center font-black text-white text-[10px]">C</div>
            <span className="font-black text-sm text-gray-800">{coinBalance}</span>
          </div>
          <button onClick={onDebugAddCoin} className="w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg font-bold border-2 border-white active:scale-90 transition-transform" aria-label="코인 충전">
             +
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur shadow-lg border border-blue-200 rounded-full h-10 pl-2 pr-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center font-black text-white text-[10px]">B</div>
          <span className="font-black text-sm text-gray-800">{boxCount}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-between w-full pt-20 pb-12 px-8">
        {/* 모드 전환 바 - 출렁임 방지를 위해 visibility 대신 opacity/pointer-events 사용 */}
        <div className={`flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-full mb-8 transition-opacity duration-300 ${(isRolling || showQuestionMark) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button onClick={() => onModeChange('food')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${currentMode === 'food' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400'}`}>🍎 식량</button>
          <button onClick={() => onModeChange('equipment')} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${currentMode === 'equipment' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>🚲 장비</button>
        </div>

        {/* 메인 슬롯 비주얼 - 크기 및 내부 정렬 고정 (UI 분리 방지) */}
        <div className="relative w-72 h-72 flex items-center justify-center flex-shrink-0">
            {/* Background Blob: Separated Pulse Animation from Color Change */}
            <div className="absolute inset-0 rounded-full blur-3xl opacity-20 animate-pulse">
                <div className={`w-full h-full rounded-full transition-colors duration-500 ${currentMode === 'food' ? 'bg-brand-500' : 'bg-blue-500'}`}></div>
            </div>
            
            {/* Spinning Ring: Separated Rotation from Color Change */}
            <div className={`absolute inset-0 rounded-full ${(isRolling || showQuestionMark) ? 'animate-spin' : 'animate-spin-slow'}`}>
                 <div className={`w-full h-full rounded-full border-8 border-dashed transition-colors duration-500 ${currentMode === 'food' ? 'border-brand-100' : 'border-blue-100'}`}></div>
            </div>

            <div className="absolute inset-10 rounded-full bg-white shadow-2xl border-2 border-gray-50 flex items-center justify-center z-10 overflow-hidden text-center">
              <div className="flex items-center justify-center w-full h-full p-4 relative">
                {showQuestionMark ? (
                   <span className="text-9xl font-black text-brand-500 animate-bounce font-cute leading-none">?</span>
                ) : isRolling ? (
                  <span className="text-2xl font-black text-brand-900 animate-shake break-keep leading-tight">{shufflingName}</span>
                ) : (
                  // Removed animate-pop to prevent repeated popping animation on tab switch
                  <div className="flex flex-col items-center">
                    <span className="text-8xl mb-2 drop-shadow-md leading-none transition-transform duration-300 transform key={currentMode}">{currentMode === 'food' ? '🍎' : '🚲'}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{poolSize} ITEMS IN POOL</span>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* 버튼 섹션 - 높이 고정으로 레이아웃 출렁임 차단 */}
        <div className="w-full flex flex-col gap-4 mt-10">
          {(isRolling || showQuestionMark) ? (
            <div className="h-[88px] w-full">
              <button
                onClick={isRolling ? onStopRoll : undefined}
                className={`w-full h-full text-white rounded-[2.5rem] font-black text-2xl shadow-xl border-b-8 transition-all flex items-center justify-center ${isRolling ? 'bg-red-500 border-red-800 animate-pulse active:scale-95' : 'bg-gray-400 border-gray-600 cursor-default'}`}
              >
                {showQuestionMark ? '두근두근...' : 'STOP!'}
              </button>
            </div>
          ) : (
            <div className="h-[88px] w-full">
              {currentMode === 'food' ? (
                <button
                  onClick={onRoll}
                  disabled={coinBalance < 1}
                  className={`w-full h-full rounded-[2.5rem] font-black text-xl shadow-xl transition-all border-b-8 active:border-b-0 active:translate-y-1 ${coinBalance < 1 ? 'bg-gray-100 text-gray-300 border-gray-200' : 'bg-brand-500 text-white border-brand-800 hover:bg-brand-400'}`}
                >
                  식량 가챠 (1 Coin)
                </button>
              ) : (
                <button
                  onClick={onRoll}
                  disabled={boxCount < 1}
                  className={`w-full h-full rounded-[2.5rem] font-black text-xl shadow-xl transition-all border-b-8 active:border-b-0 active:translate-y-1 ${boxCount < 1 ? 'bg-gray-100 text-gray-300 border-gray-200' : 'bg-blue-600 text-white border-blue-900 hover:bg-blue-50 animate-float'}`}
                >
                  보급 상자 개봉 ({boxCount})
                </button>
              )}
            </div>
          )}
        </div>

        {/* 하단 GPS 트래커 패널 */}
        <div className={`w-full p-6 mt-8 rounded-[2.5rem] border-2 transition-all shadow-md ${isTracking ? 'bg-slate-900 border-slate-700 text-white shadow-brand-200' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Mining Signal</span>
            {isTracking && <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping"></div></div>}
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black tabular-nums">{currentDistance.toFixed(2)}</span>
            <span className="text-sm font-bold opacity-60">km Riding</span>
          </div>
          <button onClick={onToggleTracking} className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${isTracking ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
            {isTracking ? '채굴 일시정지' : '🚲 라이딩 시작 (코인 채굴)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GachaMachine;
