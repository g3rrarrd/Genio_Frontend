import React from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_CONFIG } from '../constants';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
  onRanking: () => void;
  onProfile: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelect, onBack, onRanking, onProfile }) => {
  return (
    <div className="h-full flex flex-col p-4 relative">
      <header className="pt-4 pb-6 shrink-0">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md active:scale-90 transition-transform mb-4"
        >
          <span className="material-symbols-outlined text-white text-lg">arrow_back_ios_new</span>
        </button>
        <h1 className="text-[40px] font-extrabold italic tracking-tighter text-center uppercase leading-[0.85] text-white">
          ELIGE TU <br/>
          <span className="text-primary drop-shadow-[0_0_15px_rgba(19,236,91,0.4)]">NIVEL</span>
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-24">
        {DIFFICULTY_CONFIG.map((level) => (
          <button 
            key={level.id}
            onClick={() => onSelect(level.id as Difficulty)}
            className="w-full relative group active:scale-[0.98] transition-all duration-200"
          >
            <div 
              className="flex items-center p-4 rounded-xl bg-card-bg border-l-4 shadow-xl shadow-black/20 text-left"
              style={{ borderLeftColor: level.color }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mr-3 border shrink-0"
                style={{ backgroundColor: `${level.color}15`, borderColor: `${level.color}30` }}
              >
                <span className="material-symbols-outlined text-2xl fill-1" style={{ color: level.color, fontVariationSettings: "'FILL' 1" }}>
                  {level.icon}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold uppercase text-white leading-none mb-1">{level.label}</h3>
                <p className="text-white/50 text-[10px] font-medium leading-tight">{level.desc}</p>
              </div>
              <div className="text-white/20">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </div>
            </div>
          </button>
        ))}
      </main>

      <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[260px] z-50">
        <div className="flex items-center justify-between bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1 shadow-2xl">
          <button onClick={onBack} className="flex-1 flex justify-center py-2 text-white/40"><span className="material-symbols-outlined text-xl">home</span></button>
          <button className="flex-1 flex justify-center py-2 text-primary">
            <div className="relative flex flex-col items-center">
              <span className="material-symbols-outlined text-xl fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
              <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
            </div>
          </button>
          <button onClick={onRanking} className="flex-1 flex justify-center py-2 text-white/40"><span className="material-symbols-outlined text-xl">leaderboard</span></button>
          <button onClick={onProfile} className="flex-1 flex justify-center py-2 text-white/40 active:text-primary"><span className="material-symbols-outlined text-xl">person</span></button>
        </div>
      </nav>
    </div>
  );
};

export default DifficultySelector;
