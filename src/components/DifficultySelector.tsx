import React from 'react';
import { Difficulty } from '../../types';
import { DIFFICULTY_CONFIG } from '../../constants';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
  onRanking: () => void;
  onProfile: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect, onBack, onRanking, onProfile }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col p-4 lg:p-8 3xl:p-12 4k:p-16 max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl 4k:max-w-6xl mx-auto w-full relative overflow-x-hidden">
      <header className="pt-3 sm:pt-4 pb-4 sm:pb-6 lg:pb-8 shrink-0">
        <button 
          onClick={onBack}
          className="w-8 h-8 sm:w-9 sm:h-9 lg:w-11 lg:h-11 3xl:w-14 3xl:h-14 4k:w-18 4k:h-18 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md active:scale-90 transition-transform mb-3 sm:mb-4"
        >
          <span className="material-symbols-outlined text-white text-base sm:text-lg 3xl:text-xl 4k:text-2xl">arrow_back_ios_new</span>
        </button>
        <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] xl:text-[56px] 3xl:text-[72px] 4k:text-[96px] font-extrabold italic tracking-tighter text-center uppercase leading-[0.85] text-white">
          ELIGE TU <br/>
          <span className="text-primary drop-shadow-[0_0_15px_rgba(19,236,91,0.4)]">NIVEL</span>
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-2 sm:space-y-3 lg:space-y-4 3xl:space-y-5 4k:space-y-6 pb-24 3xl:pb-32 4k:pb-40">
        {DIFFICULTY_CONFIG.map((level) => (
          <button 
            key={level.id}
            onClick={() => onSelect(level.id as Difficulty)}
            className="w-full relative group active:scale-[0.98] transition-all duration-200"
          >
            <div 
              className="flex items-center p-3 sm:p-4 lg:p-5 3xl:p-7 4k:p-9 rounded-xl bg-card-bg border-l-4 shadow-xl shadow-black/20 text-left"
              style={{ borderLeftColor: level.color }}
            >
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 3xl:w-20 3xl:h-20 4k:w-24 4k:h-24 rounded-lg flex items-center justify-center mr-2.5 sm:mr-3 3xl:mr-5 4k:mr-6 border shrink-0"
                style={{ backgroundColor: `${level.color}15`, borderColor: `${level.color}30` }}
              >
                <span className="material-symbols-outlined text-xl sm:text-2xl lg:text-3xl 3xl:text-4xl 4k:text-5xl fill-1" style={{ color: level.color, fontVariationSettings: "'FILL' 1" }}>
                  {level.icon}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg lg:text-xl 3xl:text-2xl 4k:text-3xl font-bold uppercase text-white leading-none mb-1">{level.label}</h3>
                <p className="text-white/50 text-[9px] sm:text-[10px] lg:text-xs 3xl:text-sm 4k:text-base font-medium leading-tight">{level.desc}</p>
              </div>
              <div className="text-white/20">
                <span className="material-symbols-outlined text-xl 3xl:text-2xl 4k:text-3xl">chevron_right</span>
              </div>
            </div>
          </button>
        ))}
      </main>

      <nav className="absolute bottom-4 sm:bottom-6 3xl:bottom-8 4k:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[240px] sm:max-w-[260px] lg:max-w-[300px] 3xl:max-w-[400px] 4k:max-w-[500px] z-50">
        <div className="flex items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1 shadow-2xl">
          <button onClick={onBack} className="flex-1 flex justify-center py-2 3xl:py-3 4k:py-4 text-white/40"><span className="material-symbols-outlined text-xl 3xl:text-2xl 4k:text-3xl">home</span></button>
          <button className="flex-1 flex justify-center py-2 3xl:py-3 4k:py-4 text-primary">
            <div className="relative flex flex-col items-center">
              <span className="material-symbols-outlined text-xl 3xl:text-2xl 4k:text-3xl fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
              <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
            </div>
          </button>
          <button onClick={onRanking} className="flex-1 flex justify-center py-2 3xl:py-3 4k:py-4 text-white/40"><span className="material-symbols-outlined text-xl 3xl:text-2xl 4k:text-3xl">leaderboard</span></button>
          <button onClick={onProfile} className="flex-1 flex justify-center py-2 3xl:py-3 4k:py-4 text-white/40 active:text-primary"><span className="material-symbols-outlined text-xl 3xl:text-2xl 4k:text-3xl">person</span></button>
        </div>
      </nav>
    </div>
  );
};

export default DifficultySelector;
