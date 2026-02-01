
import React, { useRef, useState, useMemo } from 'react';
import { StoredIngredient, Ingredient } from '../types';
import { getCategoryColor, INITIAL_CATEGORIES } from '../constants';
import SynthesisAnimation from './SynthesisAnimation';

interface WarehouseProps {
  items: StoredIngredient[];
  ingredientsPool: Ingredient[];
  equipmentPool: Ingredient[];
  goldBalance: number;
  onUseItem: (instanceId: string, amount: number) => void;
  onClearAll: () => void;
  onReorder: (newOrder: StoredIngredient[]) => void;
  onSynthesize: (id1: string, id2: string) => void;
  onSynthesisComplete: (selectedItem: Ingredient) => void;
  onNavigateToGacha: () => void;
}

type SortOption = 'latest' | 'tier-desc' | 'tier-asc' | 'category';

const Warehouse: React.FC<WarehouseProps> = ({ 
  items, 
  ingredientsPool,
  equipmentPool,
  goldBalance,
  onUseItem, 
  onClearAll, 
  onSynthesize,
  onSynthesisComplete,
  onNavigateToGacha
}) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const [isSynthesisMode, setIsSynthesisMode] = useState(false);
  const [selectedForSynth, setSelectedForSynth] = useState<string[]>([]);
  const [synthResult, setSynthResult] = useState<{ item1: StoredIngredient, item2: StoredIngredient, result: Ingredient } | null>(null);

  const [usePriceInputId, setUsePriceInputId] = useState<string | null>(null);
  const [expenditureAmount, setExpenditureAmount] = useState<string>('');
  
  const [insufficientWarning, setInsufficientWarning] = useState<{amount: number} | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOption>('latest');

  const [inventoryTab, setInventoryTab] = useState<'food' | 'equipment'>('food');

  const formatName = (name: string) => {
    if (!name.includes('(')) return name;
    const [main, sub] = name.split('(');
    return (
      <>
        {main}
        <br />
        <span className="text-[0.75em] opacity-80 font-medium leading-none">({sub}</span>
      </>
    );
  };

  const currentTabItems = useMemo(() => {
    return items.filter(item => (item.type || 'food') === inventoryTab);
  }, [items, inventoryTab]);

  const availableCategories = useMemo(() => {
    const cats = new Set(currentTabItems.map(i => i.category));
    return Array.from(cats).sort((a: any, b: any) => {
      const idxA = INITIAL_CATEGORIES.indexOf(a);
      const idxB = INITIAL_CATEGORIES.indexOf(b);
      return idxA - idxB;
    });
  }, [currentTabItems]);

  const displayItems = useMemo(() => {
    let result = [...currentTabItems];
    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory);
    }
    result.sort((a, b) => {
      // 1. 사용한 아이템은 항상 맨 아래로 (최우선 순위)
      if (a.isUsed && !b.isUsed) return 1;
      if (!a.isUsed && b.isUsed) return -1;

      // 2. 합성 모드일 때 합성 가능한 것 우선
      if (isSynthesisMode) {
        const aSynth = !a.isUsed && a.canSynthesize;
        const bSynth = !b.isUsed && b.canSynthesize;
        if (aSynth && !bSynth) return -1;
        if (!aSynth && bSynth) return 1;
      }

      // 3. 사용자 선택 정렬 옵션
      if (sortOrder === 'latest') return (b.storedAt || 0) - (a.storedAt || 0);
      if (sortOrder === 'tier-desc') {
        const tierDiff = (b.tier || 3) - (a.tier || 3);
        return tierDiff !== 0 ? tierDiff : (b.storedAt || 0) - (a.storedAt || 0);
      }
      if (sortOrder === 'tier-asc') {
        const tierDiff = (a.tier || 3) - (b.tier || 3);
        return tierDiff !== 0 ? tierDiff : (b.storedAt || 0) - (a.storedAt || 0);
      }
      if (sortOrder === 'category') {
        const idxA = INITIAL_CATEGORIES.indexOf(a.category);
        const idxB = INITIAL_CATEGORIES.indexOf(b.category);
        if (idxA !== idxB) return idxA - idxB;
        return (b.tier || 3) - (a.tier || 3);
      }
      return 0;
    });
    return result;
  }, [currentTabItems, filterCategory, sortOrder, isSynthesisMode]);

  const activeCount = currentTabItems.filter(i => !i.isUsed).length;
  const usedCount = currentTabItems.filter(i => i.isUsed).length;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    if (filterCategory !== 'all' || sortOrder !== 'latest' || isSynthesisMode) return;
    dragItem.current = position;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    const el = e.target as HTMLDivElement;
    el.style.opacity = '0.5';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    if (filterCategory !== 'all' || sortOrder !== 'latest' || isSynthesisMode) return;
    dragOverItem.current = position;
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (filterCategory !== 'all' || sortOrder !== 'latest' || isSynthesisMode) return;
    setIsDragging(false);
    const el = e.target as HTMLDivElement;
    el.style.opacity = '1';
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSort = () => {
    return; 
  };
  
  const toggleSynthesisMode = () => {
    if (isSynthesisMode) {
      setIsSynthesisMode(false);
      setSelectedForSynth([]);
    } else {
      setIsSynthesisMode(true);
      setShowOptionsMenu(false);
    }
  };

  const handleItemClick = (item: StoredIngredient) => {
    if (item.isUsed) return;
    if (isSynthesisMode) {
      if (!item.canSynthesize) return;
      setSelectedForSynth(prev => {
        if (prev.includes(item.instanceId)) {
          return prev.filter(id => id !== item.instanceId);
        } else {
          if (prev.length >= 2) return prev;
          if (prev.length === 1) {
             const firstItem = items.find(i => i.instanceId === prev[0]);
             if (firstItem && firstItem.type !== item.type) {
                alert("같은 종류(식량끼리 또는 장비끼리)만 합성할 수 있습니다.");
                return prev;
             }
          }
          return [...prev, item.instanceId];
        }
      });
    }
  };

  const handleUseConfirm = () => {
    if (usePriceInputId) {
      const amount = parseInt(expenditureAmount, 10) || 0;
      if (amount < 0) return;
      if (amount > goldBalance) {
        setInsufficientWarning({ amount });
        return;
      }
      onUseItem(usePriceInputId, amount);
      setUsePriceInputId(null);
      setExpenditureAmount('');
    }
  };

  const handleForceUse = () => {
    if (usePriceInputId && insufficientWarning) {
      onUseItem(usePriceInputId, insufficientWarning.amount);
      setUsePriceInputId(null);
      setExpenditureAmount('');
      setInsufficientWarning(null);
    }
  };

  const preCalculateSynthesis = () => {
    if (selectedForSynth.length !== 2) return;
    if (goldBalance < 1000) {
      alert("합성 비용(1,000원)이 부족합니다!");
      return;
    }
    const item1 = items.find(i => i.instanceId === selectedForSynth[0])!;
    const item2 = items.find(i => i.instanceId === selectedForSynth[1])!;
    const isEquipment = (item1.type || 'food') === 'equipment';
    const currentPool = isEquipment ? equipmentPool : ingredientsPool;

    let targetTier = 3;
    let pool: Ingredient[] = [];
    if (item1.category === item2.category) {
      targetTier = Math.min(5, (item1.tier || 3) + (item2.tier || 3));
      pool = currentPool.filter(i => i.category === item1.category && (i.tier || 3) === targetTier);
      if (pool.length === 0) pool = currentPool.filter(i => i.category === item1.category);
    } else {
      const avg = ((item1.tier || 3) + (item2.tier || 3)) / 2;
      targetTier = Math.max(1, Math.min(5, Math.random() < 0.5 ? Math.floor(avg) : Math.ceil(avg)));
      pool = currentPool.filter(i => (i.tier || 3) === targetTier);
    }
    if (pool.length === 0) pool = currentPool;
    const resultItem = pool[Math.floor(Math.random() * pool.length)];
    setSynthResult({ item1, item2, result: resultItem });
  };

  const getSortLabel = () => {
    switch(sortOrder) {
      case 'latest': return '최신순';
      case 'tier-desc': return '등급 높은순';
      case 'tier-asc': return '등급 낮은순';
      case 'category': return '카테고리순';
      default: return '정렬';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 relative">
      {synthResult && (
        <SynthesisAnimation 
          item1={synthResult.item1}
          item2={synthResult.item2}
          result={synthResult.result}
          onCancel={() => setSynthResult(null)}
          onComplete={(res) => {
            onSynthesize(synthResult.item1.instanceId, synthResult.item2.instanceId);
            onSynthesisComplete(res);
            setSynthResult(null);
            setIsSynthesisMode(false);
            setSelectedForSynth([]);
          }}
        />
      )}

      <div className="px-5 py-4 bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 flex flex-col gap-3 shadow-sm">
        <div className="flex justify-start -mb-1">
           <button 
             onClick={onNavigateToGacha}
             className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-600 bg-gray-100 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors"
           >
             ⬅️ 뽑기 하러 가기
           </button>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
             <h2 className="text-xl font-black text-gray-800">나의 가방</h2>
             <span className={`text-xs font-black mt-0.5 ${goldBalance < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                 잔액: {goldBalance.toLocaleString()}원
             </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleSynthesisMode}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-sm ${isSynthesisMode ? 'bg-purple-500 text-white border-purple-600 animate-pulse' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'}`}
            >
              {isSynthesisMode ? '⚗️ 합성 종료' : '⚗️ 합성 (1,000원)'}
            </button>
            {!isSynthesisMode && (
              <button 
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 border border-red-200 transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                🔄 초기화
              </button>
            )}
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 relative">
          <button 
            onClick={() => { setInventoryTab('food'); setFilterCategory('all'); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${inventoryTab === 'food' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-400'}`}
          >
            🍎 식량 ({items.filter(i => (i.type||'food')==='food').length})
          </button>
          <button 
            onClick={() => { setInventoryTab('equipment'); setFilterCategory('all'); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${inventoryTab === 'equipment' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            🚲 장비 ({items.filter(i => i.type==='equipment').length})
          </button>
        </div>

         <div className="flex justify-between items-center px-1">
             <span className="text-xs text-gray-500 font-bold">
               보유 <span className="text-brand-600">{activeCount}</span>개 / 사용 <span className="text-gray-400">{usedCount}</span>개
             </span>
         </div>

        <div className="relative">
          <button 
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all font-bold text-sm shadow-sm active:scale-[0.98] ${
              isSynthesisMode 
                ? 'bg-purple-50 border-purple-200 text-purple-700' 
                : (filterCategory !== 'all' || sortOrder !== 'latest')
                  ? 'bg-brand-50 border-brand-200 text-brand-700' 
                  : 'bg-gray-100 border-gray-200 text-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <span className="text-lg">{isSynthesisMode ? '🧪' : '🔍'}</span>
              <span className="whitespace-nowrap truncate">
                {filterCategory === 'all' ? '전체 카테고리' : filterCategory} • {getSortLabel()}
              </span>
            </div>
            <span className={`text-xs transition-transform ${showOptionsMenu ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showOptionsMenu && (
            <>
              <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]" onClick={() => setShowOptionsMenu(false)} />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 z-[70] overflow-hidden animate-pop origin-top">
                <div className="p-4 border-b border-gray-50">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">카테고리 필터</h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterCategory === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>전체보기</button>
                    {availableCategories.map(cat => (
                      <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filterCategory === cat ? 'bg-brand-500 text-white border-brand-500' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{cat}</button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50/30">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">정렬 방식</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[{id:'latest',label:'최신 획득순',icon:'🕒'}, {id:'category',label:'카테고리순',icon:'📂'}, {id:'tier-desc',label:'등급 높은순',icon:'⭐'}, {id:'tier-asc',label:'등급 낮은순',icon:'📉'}].map((opt) => (
                      <button key={opt.id} onClick={() => setSortOrder(opt.id as SortOption)} className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg border transition-all ${sortOrder === opt.id ? 'bg-white border-brand-500 text-brand-600 shadow-sm' : 'bg-white border-gray-200 text-gray-500'}`}>
                        <span>{opt.icon}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowOptionsMenu(false)} className="w-full py-4 bg-gray-800 text-white font-black text-sm hover:bg-gray-700 active:bg-gray-900 transition-colors">확인</button>
              </div>
            </>
          )}
        </div>

        {isSynthesisMode && (
          <div className="bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 text-[10px] text-purple-700 animate-pop flex items-center justify-between">
            <span>✨ 합성 가능한 재료 2개를 선택하세요!</span>
            <span className="font-bold bg-purple-200 px-2 py-0.5 rounded-full">{selectedForSynth.length}/2</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
             <span className="text-4xl mb-2">🔎</span>
             <p className="font-bold">보관함이 비어있거나 조건에 맞는 아이템이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-24">
            {displayItems.map((item, index) => {
              const colorClass = getCategoryColor(item.category);
              const isSelected = selectedForSynth.includes(item.instanceId);
              const canBeSynthesized = item.canSynthesize;
              const mainName = item.name.split('(')[0];
              const nameLength = mainName.length;

              return (
                <div
                  key={item.instanceId}
                  onClick={() => handleItemClick(item)}
                  draggable={!item.isUsed && (filterCategory === 'all' && sortOrder === 'latest') && !isSynthesisMode}
                  onDragStart={(e) => !item.isUsed && handleDragStart(e, index)}
                  onDragEnter={(e) => !item.isUsed && handleDragEnter(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                     e.preventDefault();
                     if (!item.isUsed && (filterCategory === 'all' && sortOrder === 'latest') && !isSynthesisMode && dragItem.current !== index) handleSort();
                  }}
                  className={`
                    relative bg-white rounded-2xl shadow-sm border-2
                    transition-all duration-200 flex flex-col overflow-hidden
                    ${isDragging && dragItem.current === index ? 'opacity-0' : 'opacity-100'}
                    ${isSynthesisMode 
                        ? (item.isUsed || !canBeSynthesized
                            ? 'opacity-30 grayscale border-gray-100' 
                            : isSelected 
                                ? 'border-purple-500 ring-4 ring-purple-100 scale-95 shadow-md bg-purple-50' 
                                : 'border-gray-200 hover:border-purple-300 cursor-pointer shadow-sm'
                          )
                        : (item.isUsed ? 'opacity-60 grayscale border-transparent bg-gray-50' : 'cursor-move hover:shadow-md hover:scale-[1.02] border-transparent')
                    }
                  `}
                >
                  {!item.isUsed && (
                    <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-black z-10 border ${canBeSynthesized ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {canBeSynthesized ? '✨ 합성가능' : '🚫 불가'}
                    </div>
                  )}

                  {isSynthesisMode && !item.isUsed && canBeSynthesized && (
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${isSelected ? 'bg-purple-500 border-purple-500 text-white shadow-lg' : 'border-gray-300 bg-white/80'}`}>
                      {isSelected ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300">+</span>
                      )}
                    </div>
                  )}
                  <div className={`h-2 w-full ${colorClass.split(' ')[0]}`}></div>
                  <div className="p-3 flex flex-col h-full justify-between mt-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colorClass}`}>{item.category}</span>
                      <span className="text-[10px]">{'⭐'.repeat(item.tier || 3)}</span>
                    </div>
                    <div className="text-center mb-3">
                      <h3 className={`font-black leading-tight text-gray-800 break-keep tracking-tight ${nameLength > 5 ? 'text-sm' : 'text-lg'}`}>
                        {formatName(item.name)}
                      </h3>
                    </div>
                    {!isSynthesisMode && (
                      <div className="flex flex-col gap-1.5">
                        {item.isUsed ? (
                          <div className="flex flex-col items-center gap-1 py-1">
                            <span className="text-[10px] font-bold text-gray-400">지출 완료</span>
                            <span className="text-xs font-black text-red-500">-{item.spentAmount?.toLocaleString()}원</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setUsePriceInputId(item.instanceId); }}
                            className="w-full py-1.5 text-xs font-bold rounded-lg transition-colors bg-brand-100 hover:bg-brand-200 text-brand-700 shadow-sm"
                          >
                            🍽️ 사용하기
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isSynthesisMode && (
        <div className="absolute bottom-5 left-5 right-5 z-50 animate-drop-in">
           <button 
             onClick={preCalculateSynthesis}
             disabled={selectedForSynth.length !== 2}
             className={`w-full py-4 rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] font-black text-lg flex items-center justify-center gap-2 transition-all ${
               selectedForSynth.length === 2 
               ? 'bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 text-white scale-105 active:scale-95' 
               : 'bg-gray-800 text-gray-500'
             }`}
           >
             {selectedForSynth.length === 2 ? '⚗️ 합성 실험 시작! (1,000원)' : `재료를 선택하세요 (${selectedForSynth.length}/2)`}
           </button>
        </div>
      )}

      {insufficientWarning && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-pop">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center border-4 border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-3xl animate-pulse">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">잔액이 부족합니다!</h3>
            
            <div className="bg-red-50 p-4 rounded-xl w-full mb-6 border border-red-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-bold">현재 잔액</span>
                <span className="text-sm font-black text-gray-700">{goldBalance.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-red-500 font-bold">지출 금액</span>
                <span className="text-sm font-black text-red-500">-{insufficientWarning.amount.toLocaleString()}원</span>
              </div>
              <div className="w-full h-px bg-red-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-900 font-bold">예상 잔액</span>
                <span className="text-lg font-black text-red-600">{(goldBalance - insufficientWarning.amount).toLocaleString()}원</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6 font-medium leading-tight">
              그래도 지출을 진행하시겠습니까?<br/>잔액이 마이너스가 됩니다.
            </p>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setInsufficientWarning(null)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleForceUse}
                className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg hover:bg-red-600 transition-all active:scale-95"
              >
                강제 지출
              </button>
            </div>
          </div>
        </div>
      )}

      {usePriceInputId && !insufficientWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-pop">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-3xl">💸</div>
            <h3 className="text-xl font-black text-gray-800 mb-1">지출 금액 입력</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">실제 얼마에 구매하셨나요?<br/>골드에서 차감됩니다.</p>
            
            <div className="w-full relative mb-8">
              <input 
                type="number"
                inputMode="numeric"
                value={expenditureAmount}
                onChange={(e) => setExpenditureAmount(e.target.value)}
                placeholder="0"
                className="w-full text-center text-4xl font-black text-brand-600 bg-gray-50 border-b-4 border-brand-200 focus:border-brand-500 outline-none py-3 tabular-nums transition-colors"
                autoFocus
              />
              <span className="absolute right-4 bottom-4 text-gray-400 font-bold">원</span>
            </div>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => { setUsePriceInputId(null); setExpenditureAmount(''); }}
                className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleUseConfirm}
                className="flex-1 py-4 bg-brand-500 text-white font-black rounded-2xl shadow-lg hover:bg-brand-600 transition-all active:scale-95"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop">
          <div className="bg-white w-full max-sm rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold mb-4">가방을 비울까요?</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">취소</button>
              <button onClick={() => { onClearAll(); setShowClearConfirm(false); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">비우기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouse;
