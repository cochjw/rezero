
import React, { useEffect } from 'react';
import { Ingredient, GachaSelection } from '../types';
import { getCategoryColor } from '../constants';
import { playFanfareSound, stopShakingSound, playWoodenFishSound } from '../utils/sound';

interface RecipeResultProps {
  selections: GachaSelection[];
  onClose: () => void;
  onComplete: (selectedItem: Ingredient, goldReward: number) => void;
}

const RecipeResult: React.FC<RecipeResultProps> = ({ selections, onClose, onComplete }) => {
  const isRevealed = true; 
  const finalChoice = null;

  useEffect(() => {
    stopShakingSound();
  }, []);

  const resultSelection = finalChoice || (selections.length === 1 ? selections[0] : null);
  // High value check: >= 30,000 KRW
  const isResultHighValue = resultSelection ? resultSelection.goldReward >= 30000 : false;
  // Jackpot check: 100,000 KRW
  const isResultJackpot = resultSelection ? resultSelection.goldReward >= 100000 : false;

  useEffect(() => {
    if (resultSelection) {
      if (resultSelection.goldReward > 0) {
        playFanfareSound();
      } else {
        // Play Moktak sound if reward is 0 (Musoyu)
        playWoodenFishSound();
      }
    }
  }, [resultSelection]);

  const handleSelect = (sel: GachaSelection) => {
    onComplete(sel.ingredient, sel.goldReward);
  };

  const handleConfirm = () => {
    if (resultSelection) {
      onComplete(resultSelection.ingredient, resultSelection.goldReward);
    }
  };

  const isSelectionMode = selections.length > 1 && !finalChoice;
  
  const renderStars = (tier: number) => '⭐'.repeat(tier || 3);

  const formatName = (name: string) => {
    if (!name.includes('(')) return name;
    const [main, sub] = name.split('(');
    return (
      <>
        {main}
        <br />
        <span className="text-[0.4em] opacity-80 font-bold leading-none tracking-tight">({sub}</span>
      </>
    );
  };

  const renderCard = (selection: GachaSelection) => {
    const { ingredient: item, goldReward } = selection;
    const colorClasses = getCategoryColor(item.category);
    // Extract background class for ticket cutouts (e.g., 'bg-rose-100')
    const bgClass = colorClasses.split(' ')[0]; 

    const mainName = item.name.split('(')[0];
    const nameLength = mainName.length;
    
    // Adaptive Font Sizing based on character count to prevent overflow
    // Aggressive scaling allowing text to wrap for maximum visual impact
    let fontSizeClass = '';
    
    if (nameLength > 12) fontSizeClass = 'text-3xl';
    else if (nameLength > 9) fontSizeClass = 'text-4xl';
    else if (nameLength > 5) fontSizeClass = 'text-5xl';  // 6-9 chars (Previously 8-9 was 5xl, 6-7 was 6xl. Now 6+ is 5xl)
    else if (nameLength === 5) fontSizeClass = 'text-6xl';  // 5 chars
    else if (nameLength === 4) fontSizeClass = 'text-7xl'; // 4 chars (Wraps 2+2 usually)
    // 1~3 chars use the same max size
    else fontSizeClass = 'text-[5.5rem]'; 

    const isJackpot = goldReward >= 100000;
    const isHighValue = goldReward >= 30000;
    const isNoGold = goldReward === 0;
    
    // Determine border color for high value items, but keep background from category
    let borderColorClass = ''; 
    if (isJackpot) borderColorClass = 'border-yellow-400';
    else if (isHighValue) borderColorClass = 'border-amber-300';

    return (
      <div 
        className={`
          relative flex flex-col items-center
          transition-all duration-300 transform
          w-72 h-[28rem]
          rounded-[2rem] border-[6px] shadow-2xl overflow-hidden
          ${colorClasses}
          ${borderColorClass}
          ${isHighValue ? 'ring-4 ring-yellow-300 ring-offset-4 ring-offset-black/50' : ''}
        `}
      >
         {isRevealed && (
             <div className="w-full h-full flex flex-col relative animate-pop">
                 {/* Card Header (Category & Tier) - Increased visibility */}
                 <div className="w-full px-4 py-4 flex justify-between items-center z-10">
                    <span className="text-sm font-black tracking-widest uppercase bg-white/50 px-3 py-1 rounded-full border border-current/20 backdrop-blur-sm shadow-sm">
                      {item.category}
                    </span>
                    <span className="text-lg tracking-tighter filter drop-shadow-sm">
                      {renderStars(item.tier || 3)}
                    </span>
                 </div>

                 {/* Main Content (Name) - Maximized space usage with wrapping */}
                 <div className="flex-1 flex flex-col items-center justify-center z-10 text-center px-4 -mt-2 w-full">
                    <h3 className={`font-cute font-black leading-none drop-shadow-sm break-words whitespace-normal tracking-tighter w-full ${fontSizeClass}`}>
                      {formatName(item.name)}
                    </h3>
                 </div>

                 {/* Gold Reward Section - Bigger ticket */}
                 <div className="w-full px-4 pb-6 z-20">
                   <div className={`
                      relative w-full rounded-2xl p-1 shadow-lg transform transition-transform
                      ${isNoGold ? 'bg-stone-200' : 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500'}
                    `}>
                      <div className={`
                        w-full rounded-xl py-4 px-2 flex flex-col items-center justify-center
                        border-2 border-dashed
                        ${isNoGold ? 'bg-stone-50 border-stone-300' : 'bg-white/90 border-amber-500/30'}
                      `}>
                         {isNoGold ? (
                           <>
                             <div className="text-5xl opacity-80 mb-1 animate-float">🧘</div>
                             <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Empty Mind</span>
                             <div className="mt-2 px-3 py-1 bg-stone-200 text-stone-600 text-xs font-black rounded-full">
                               무소유
                             </div>
                             <div className="mt-1 text-[10px] text-stone-400 font-medium italic">
                               "욕심을 버리면 평화가 옵니다"
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="flex items-center justify-center gap-2 mb-1 w-full">
                                <span className="text-2xl filter drop-shadow-sm">💰</span>
                                <span className="text-xs font-black text-amber-900 uppercase tracking-widest opacity-60">GOLD REWARD</span>
                                <span className="text-2xl filter drop-shadow-sm">💰</span>
                             </div>
                             
                             <div className="flex items-baseline justify-center gap-1 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 shadow-inner w-full">
                               <span className={`font-black tracking-tighter font-mono leading-none ${isHighValue ? 'text-4xl text-amber-600' : 'text-3xl text-amber-700'}`}>
                                 {goldReward.toLocaleString()}
                               </span>
                               <span className="text-lg font-bold text-amber-700/70">원</span>
                             </div>

                             {(isJackpot || isHighValue) && (
                               <div className="mt-2 flex gap-1 w-full justify-center">
                                  {isJackpot && <span className="text-[10px] font-black text-white bg-red-500 px-3 py-1 rounded-full animate-pulse shadow-sm border border-red-400 flex-1 text-center">✨ JACKPOT ✨</span>}
                                  {isHighValue && !isJackpot && <span className="text-[10px] font-black text-white bg-amber-500 px-3 py-1 rounded-full shadow-sm border border-amber-400 flex-1 text-center">🔥 BIG WIN 🔥</span>}
                               </div>
                             )}
                           </>
                         )}
                      </div>
                      
                      {/* Ticket Cutouts - Matching card background color to look like holes */}
                      <div className={`absolute top-1/2 -left-1.5 w-3 h-6 rounded-r-full -translate-y-1/2 shadow-inner ${bgClass}`}></div>
                      <div className={`absolute top-1/2 -right-1.5 w-3 h-6 rounded-l-full -translate-y-1/2 shadow-inner ${bgClass}`}></div>
                   </div>
                 </div>

                 {/* Decorative Elements */}
                 {isJackpot && <div className="absolute inset-0 bg-yellow-400 mix-blend-overlay opacity-30 animate-pulse pointer-events-none"></div>}
                 <div className="absolute inset-0 glint-effect animate-glint pointer-events-none opacity-30"></div>
             </div>
         )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-sm flex flex-col relative">
        {/* Header Message */}
        {isSelectionMode ? (
           <div className="absolute top-4 left-0 right-0 z-50 flex justify-center animate-drop-in">
             <div className="bg-white text-brand-600 px-6 py-3 rounded-full shadow-2xl font-black text-lg border-2 border-brand-100 animate-bounce flex items-center gap-2">
               <span>👇</span> 하나를 선택하세요!
             </div>
           </div>
        ) : (
           <div className="absolute top-8 left-0 right-0 z-50 flex flex-col items-center animate-drop-in text-white drop-shadow-lg">
             <div className="text-4xl">🎉</div>
             <div className="font-black text-2xl tracking-tight">축하합니다!</div>
           </div>
        )}

        <button 
          onClick={onClose}
          className="absolute right-0 top-0 z-[60] w-10 h-10 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20 transition backdrop-blur-md m-2 border border-white/20 shadow-lg"
        >
          ✕
        </button>

        <div className="w-full h-full flex items-center justify-center">
          {isSelectionMode && (
             <div className="w-full flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar px-8 py-20 items-center h-full">
               {selections.map((sel, idx) => (
                 <div key={idx} className="flex-shrink-0 snap-center flex flex-col items-center justify-center relative transform transition-all hover:scale-105">
                      <div className="animate-pop" style={{ animationDelay: `${idx * 100}ms` }}>
                        {renderCard(sel)}
                      </div>
                      <button
                        onClick={() => handleSelect(sel)}
                        className={`w-48 py-3 font-black text-lg rounded-xl transition-all shadow-xl mt-6 z-20 bg-white text-brand-600 hover:bg-brand-50 active:scale-95 animate-pop border-b-4 border-brand-100`}
                      >
                        선택하기
                      </button>
                 </div>
               ))}
             </div>
          )}

          {!isSelectionMode && resultSelection && (
             <div className="flex flex-col items-center justify-center w-full animate-pop">
                {/* Glow Effect behind card for high value */}
                <div className="relative">
                   {(isResultJackpot || isResultHighValue) && (
                     <div className={`absolute inset-0 blur-3xl scale-125 rounded-full opacity-60 animate-pulse ${isResultJackpot ? 'bg-yellow-500' : 'bg-amber-400'}`}></div>
                   )}
                   <div className={`transform transition-transform duration-500 ${isResultHighValue ? 'scale-110' : 'hover:scale-105'}`}>
                      {renderCard(resultSelection)}
                   </div>
                </div>
                
                <div className="h-10"></div>
                
                <button 
                  onClick={handleConfirm}
                  className="w-64 py-4 font-black text-xl rounded-2xl transition shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95 flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-50 border-b-8 border-gray-300 ring-4 ring-white/20 animate-pop"
                >
                  <span>가방에 담기</span>
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeResult;
