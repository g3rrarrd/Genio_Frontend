import React, { useState, useEffect, useRef } from 'react';

interface RankingProps {
  userScore: number;
  userName?: string;
  userIcon?: string;
  userColor?: string;
  userId: number | null;
  onBack: () => void;
  onProfile: () => void;
  onLogout: () => void;
}

interface PlayerRank {
  rank?: number;
  name: string;
  score: number;
  avatarIcon?: string;
  avatarColor?: string;
}

const Ranking: React.FC<RankingProps> = ({ userScore, userName, userIcon, userColor, onBack, onProfile, onLogout, userId }) => {
  const [leaderboard, setLeaderboard] = useState<PlayerRank[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL;
        const url = userId 
                  ? `${baseURL}usuarios/ranking/?user_id=${userId}`
                  : `${baseURL}usuarios/ranking/`;

        const response = await fetch(url);
        const data = await response.json();
        
        setLeaderboard(data.top_20 || []);
        if (data.user_rank) setUserRank(data.user_rank);
      } catch (error) {
        console.error("Error cargando el ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [userId]);

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 3xl:p-16 4k:p-40 max-w-md lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-7xl 4k:max-w-[2200px] mx-auto bg-background-dark soccer-pattern" style={{ backgroundImage: "url('../utils/fondo 3.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      
      {/* Header Escalado */}
      <header className="pt-4 4k:pt-20 flex items-center justify-between mb-10 4k:mb-32 z-10 shrink-0">
        <button onClick={onBack} className="size-12 lg:size-20 4k:size-48 flex items-center justify-center rounded-full bg-white/5 border border-white/10 4k:border-[10px] backdrop-blur-md active:scale-90 transition-all">
          <span className="material-symbols-outlined text-white text-2xl 4k:text-[100px]">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] 4k:text-5xl font-black uppercase text-primary tracking-[0.4em] italic leading-none mb-2">Global</span>
            <h1 className="text-2xl 3xl:text-5xl 4k:text-[130px] font-black italic uppercase text-white tracking-tighter">Ranking</h1>
        </div>
        <button onClick={onProfile} className="size-12 lg:size-20 4k:size-48 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 4k:border-[10px] active:scale-90 transition-all">
          <span className="material-symbols-outlined text-primary text-2xl 4k:text-[100px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col min-h-0 z-10">
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 4k:space-y-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 4k:py-80 gap-8">
               <div className="size-16 4k:size-48 border-4 4k:border-[20px] border-primary border-t-transparent rounded-full animate-spin"></div>
               <span className="text-white/20 text-xs 4k:text-6xl font-black uppercase tracking-widest">Consultando VAR...</span>
            </div>
          ) : (
            leaderboard.map((player, index) => {
              const isUser = player.name === userName;
              const rank = player.rank || index + 1;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-5 4k:p-12 rounded-3xl 4k:rounded-[5rem] border-2 4k:border-[10px] transition-all h-24 4k:h-44 ${
                    isUser ? 'bg-primary/10 border-primary shadow-[0_0_40px_rgba(249,115,22,0.2)]' : 'bg-card-bg border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-6 4k:gap-16">
                    <div className="w-8 4k:w-24 text-center">
                      <span className={`text-lg 4k:text-7xl font-black italic ${rank <= 3 ? 'text-primary' : 'text-white/20'}`}>
                        #{rank}
                      </span>
                    </div>
                    
                    <div 
                      className="size-12 4k:size-[120px] rounded-full flex items-center justify-center bg-white/5 border 4k:border-8 border-white/10 shadow-inner"
                      style={{ backgroundColor: `${player.avatarColor || '#f5821f'}20` }}
                    >
                      <span className="material-symbols-outlined text-2xl 4k:text-[70px]" style={{ color: player.avatarColor || '#f5821f', fontVariationSettings: "'FILL' 1" }}>
                        {player.avatarIcon || 'person'}
                      </span>
                    </div>
                    
                    <span className={`text-sm 4k:text-6xl font-black uppercase truncate max-w-[120px] 4k:max-w-[800px] ${isUser ? 'text-white' : 'text-white/70'}`}>
                      {player.name}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-primary text-lg 4k:text-7xl font-black italic leading-none">{Math.floor(player.score)}</span>
                    <span className="text-[8px] 4k:text-4xl font-bold text-white/20 uppercase tracking-widest">Puntos</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sección "TU POSICIÓN" Flotante */}
        <div className="mt-6 4k:mt-20 space-y-4 4k:space-y-12">
          {userRank && (
            <div className="bg-primary p-6 4k:p-16 rounded-[2.5rem] 4k:rounded-[6rem] shadow-[0_-20px_60px_rgba(249,115,22,0.3)] flex items-center justify-between">
              <div className="flex items-center gap-6 4k:gap-20">
                <div className="flex flex-col items-center justify-center bg-background-dark/20 size-14 4k:size-40 rounded-2xl 4k:rounded-[3rem]">
                  <span className="text-background-dark text-xs 4k:text-5xl font-black leading-none">POS</span>
                  {/* CAMBIO AQUÍ: Si userRank es un objeto, usa userRank.rank */}
                  <span className="text-background-dark text-2xl 4k:text-8xl font-black italic">
                    #{typeof userRank === 'object' ? (userRank as any).rank : userRank}
                  </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-background-dark/60 text-[10px] 4k:text-5xl font-black uppercase tracking-tighter">Estás en el podio</span>
                    <span className="text-background-dark text-lg 4k:text-7xl font-black uppercase italic leading-none">{userName}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-background-dark text-2xl 4k:text-9xl font-black italic leading-none">
                  {/* Si el objeto trae el score, puedes usarlo también */}
                  {typeof userRank === 'object' ? Math.floor((userRank as any).score) : Math.floor(userScore)}
                </span>
                <span className="text-background-dark/60 text-[10px] 4k:text-4xl font-black uppercase">Tu mejor marca</span>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full h-16 4k:h-56 bg-danger/5 border-2 4k:border-[10px] border-danger/20 text-danger font-black rounded-3xl 4k:rounded-[5rem] flex items-center justify-center gap-4 4k:gap-16 active:scale-95 transition-all mb-10 4k:mb-40"
          >
            <span className="text-sm 4k:text-7xl uppercase italic tracking-widest">Abandonar Concentración</span>
            <span className="material-symbols-outlined text-2xl 4k:text-[100px]">logout</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Ranking;