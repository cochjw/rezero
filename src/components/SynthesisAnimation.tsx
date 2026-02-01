
import React, { useEffect, useState } from 'react';
import { StoredIngredient, Ingredient } from '../types';
import { getCategoryColor } from '../constants';
import { playSynthStartSound, playSynthSuccessSound } from '../utils/sound';

interface SynthesisAnimationProps {
  item1: StoredIngredient;
  item2: StoredIngredient;
  result: Ingredient;
  onComplete: (selectedItem: Ingredient) => void;
  onCancel: () => void;
}

const SynthesisAnimation: React.FC<SynthesisAnimationProps> = ({ item1, item2, result, onComplete, onCancel }) => {
  const [phase, setPhase] = useState<'idle' | 'charging' | 'impact' | 'flash' | 'reveal'>('idle');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('charging');
      playSynthStartSound();
    }, 100);
    const timer2 = setTimeout(() => setPhase('impact'), 2200);
    const timer3 = setTimeout(() => {
      setPhase('flash');
      playSynthSuccessSound();
    }, 2700);
    const timer4 = setTimeout(() => setPhase('reveal'), 3000);
    return () => {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4);
    };
  }, []);

  const renderStars = (tier: number) => '⭐'.repeat(tier || 3);

  const formatName = (name: string) => {
    if (!name.includes('(')) return name;
    const [main, sub] = name.split('(');
    return (
      <>
        {main}
        <br />
        <span className="text-[0.65em] opacity-80 font-medium leading-none">({sub}</span>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === 'charging' ? 'opacity-40' : 'opacity-0'}`}>
         <div className="absolute inset-0 energy-swirl animate-vortex"></div>
         <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(168,85,247,0.2)_0%,transparent_70%)] animate-pulse"></div>
      </div>

      {(phase === 'idle' || phase === 'charging' || phase === 'impact') && (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className={`absolute transition-all duration-[2000ms] ease-in-out ${
            phase === 'charging' ? 'translate-x-[-40px] scale-110' : 
            phase === 'impact' ? 'translate-x-0 scale-0 opacity-0' : 
            'translate-x-[-120px]'
          }`}>
            <div className={`w-32 h-44 bg-white rounded-2xl border-4 shadow-2xl p-2 flex flex-col items-center justify-center text-center ${getCategoryColor(item1.category)} ${phase === 'charging' ? 'animate-shake' : ''}`}>
               <span className="text-[10px] font-bold opacity-60 mb-2">{item1.category}</span>
               <h4 className={`font-cute font-black mb-1 leading-tight break-keep ${item1.name.split('(')[0].length > 5 ? 'text-sm' : 'text-xl'}`}>
                {formatName(item1.name)}
               </h4>
               <span className="text-xs">{renderStars(item1.tier)}</span>
            </div>
          </div>

          <div className={`absolute z-10 transition-all duration-500 ${phase === 'impact' ? 'scale-0' : 'scale-100'}`}>
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-purple-500 font-black text-purple-600 text-2xl">+</div>
          </div>

          <div className={`absolute transition-all duration-[2000ms] ease-in-out ${
            phase === 'charging' ? 'translate-x-[40px] scale-110' : 
            phase === 'impact' ? 'translate-x-0 scale-0 opacity-0' : 
            'translate-x-[120px]'
          }`}>
            <div className={`w-32 h-44 bg-white rounded-2xl border-4 shadow-2xl p-2 flex flex-col items-center justify-center text-center ${getCategoryColor(item2.category)} ${phase === 'charging' ? 'animate-shake' : ''}`}>
               <span className="text-[10px] font-bold opacity-60 mb-2">{item2.category}</span>
               <h4 className={`font-cute font-black mb-1 leading-tight break-keep ${item2.name.split('(')[0].length > 5 ? 'text-sm' : 'text-xl'}`}>
                {formatName(item2.name)}
               </h4>
               <span className="text-xs">{renderStars(item2.tier)}</span>
            </div>
          </div>

          {phase === 'impact' && (
            <div className="absolute w-20 h-20 bg-white rounded-full animate-ping opacity-75 shadow-[0_0_50px_#fff]"></div>
          )}
        </div>
      )}

      {phase === 'flash' && (
        <div className="absolute inset-0 bg-white animate-flash z-50"></div>
      )}

      {phase === 'reveal' && (
        <div className="flex flex-col items-center gap-10 animate-drop-in">
          <div className="text-center">
            <h2 className="text-purple-400 font-black text-2xl tracking-tighter mb-1 uppercase italic">New Ingredient Created!</h2>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"></div>
          </div>

          <div className={`relative w-72 h-96 bg-white rounded-3xl border-8 border-white shadow-[0_0_60px_rgba(168,85,247,0.5)] p-6 flex flex-col items-center justify-center text-center overflow-hidden ${getCategoryColor(result.category)} animate-float`}>
             <div className="absolute inset-4 border-2 border-dashed border-current opacity-20 rounded-2xl"></div>
             <div className="mb-4"><span className="text-xs font-bold uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-current/20">{result.category}</span></div>
             <h3 className={`font-cute font-black leading-[0.9] mb-4 filter drop-shadow-sm break-keep tracking-tighter ${result.name.split('(')[0].length > 8 ? 'text-5xl' : result.name.split('(')[0].length > 5 ? 'text-6xl' : 'text-7xl'}`}>
                {formatName(result.name)}
             </h3>
             <div className="mt-4 flex flex-col items-center">
                <div className="text-xl mb-1">{renderStars(result.tier)}</div>
                <div className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Ultimate Quality</div>
             </div>
             <div className="absolute inset-0 glint-effect animate-glint pointer-events-none opacity-60"></div>
          </div>
          <button onClick={() => onComplete(result)} className="w-full max-w-xs py-4 px-10 bg-white text-gray-900 font-black text-xl rounded-2xl shadow-xl active:scale-95 transition-transform hover:bg-gray-100">가방에 저장하기</button>
        </div>
      )}
      {phase === 'idle' && (
        <button onClick={onCancel} className="absolute top-6 right-6 text-gray-400 font-bold hover:text-white">SKIP ✕</button>
      )}
    </div>
  );
};

export default SynthesisAnimation;
