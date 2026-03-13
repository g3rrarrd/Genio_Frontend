import React, { useState, useEffect } from 'react'; // Agregamos los hooks

interface RankingProps {
  userScore: number;
  userName?: string;
  userIcon?: string;
  userColor?: string;
  userId: number | null;
  onBack: () => void;
  onProfile: () => void;
}

interface PlayerRank {
  rank?: number;
  name: string;
  score: number;
  avatarIcon?: string;
  avatarColor?: string;
}

const Ranking: React.FC<RankingProps> = ({ userScore, userName, userIcon, userColor, onBack, onProfile, userId }) => {
  const [leaderboard, setLeaderboard] = useState<PlayerRank[]>([]);
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
      } catch (error) {
        console.error("Error cargando el ranking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, [userId]);

  // Definimos las constantes basadas en el estado dinámico
  const top3 = leaderboard.slice(0, 3);
  const otherPlayers = leaderboard.slice(3);
  const top10Score = leaderboard.length >= 10 ? leaderboard[9].score : 0;
  const pointsToTop10 = top10Score > userScore ? Math.ceil(top10Score - userScore) : 0;

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center bg-background-dark">
      <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="italic text-primary font-bold animate-pulse">CARGANDO ESTADIO...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background-dark">
      <header className="shrink-0 bg-[#102216]/90 backdrop-blur-md border-b border-primary/10 z-20">
        <div className="flex items-center p-4 justify-between">
          <button onClick={onBack} className="text-white flex size-8 items-center justify-center active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
          </button>
          <h1 className="text-primary text-lg font-[900] italic leading-tight tracking-tighter flex-1 text-center uppercase drop-shadow-[0_0_8px_rgba(245,130,31,0.6)]">
            GENIOS DEL MUNDIAL
          </h1>
          <div className="size-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/20 text-xl">share</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-32">
        
        {/* Desafío del Genio */}
        {pointsToTop10 > 0 && (
          <div className="mb-6 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="bg-primary text-background-dark size-10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,130,31,0.4)]">
              <span className="material-symbols-outlined font-black">trending_up</span>
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Desafío del Genio</p>
              <p className="text-white text-xs font-bold">
                ¡Estás a <span className="text-primary">{pointsToTop10} pts</span> de entrar al <span className="italic">Top 10 Global</span>!
              </p>
            </div>
          </div>
        )}

        {/* Podio Compacto */}
        <div className="flex items-end justify-center gap-2 mb-8 h-48 mt-4">
          {/* SEGUNDO LUGAR */}
          {top3[1] && (
            <div className="flex flex-col items-center flex-1">
              <div className="relative mb-2">
                <div className="w-12 h-12 rounded-full border border-slate-400 bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-slate-400 text-background-dark text-[8px] font-bold px-1 rounded-full">2</div>
              </div>
              <p className="text-[8px] font-bold text-center truncate w-full text-white/80">{top3[1].name}</p>
              <div className="w-full h-12 bg-card-bg rounded-t-lg mt-1 border-t border-x border-white/10 flex items-center justify-center">
                <span className="text-[9px] font-black text-primary">{Math.floor(top3[1].score)}</span>
              </div>
            </div>
          )}

          {/* PRIMER LUGAR */}
          {top3[0] && (
            <div className="flex flex-col items-center flex-1 -mt-4">
              <div className="relative mb-2">
                <span className="material-symbols-outlined text-primary text-xl absolute -top-5 left-1/2 -translate-x-1/2 drop-shadow-[0_0_5px_#f5821f]">emoji_events</span>
                <div className="w-16 h-16 rounded-full border-2 border-primary bg-white/10 flex items-center justify-center shadow-[0_0_10px_rgba(245,130,31,0.4)]">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark text-[10px] font-black px-1.5 rounded-full">1</div>
              </div>
              <p className="text-[10px] font-black text-center truncate w-full uppercase text-white">{top3[0].name}</p>
              <div className="w-full h-20 bg-card-bg rounded-t-lg mt-1 border-t border-x border-primary flex items-center justify-center">
                <span className="text-sm font-black text-primary">{Math.floor(top3[0].score)}</span>
              </div>
            </div>
          )}

          {/* TERCER LUGAR */}
          {top3[2] && (
            <div className="flex flex-col items-center flex-1">
              <div className="relative mb-2">
                <div className="w-12 h-12 rounded-full border border-[#b87333] bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#b87333] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#b87333] text-background-dark text-[8px] font-bold px-1 rounded-full">3</div>
              </div>
              <p className="text-[8px] font-bold text-center truncate w-full text-white/80">{top3[2].name}</p>
              <div className="w-full h-10 bg-card-bg rounded-t-lg mt-1 border-t border-x border-white/5 flex items-center justify-center">
                <span className="text-[9px] font-black text-primary">{Math.floor(top3[2].score)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Jugadores */}
        <div className="space-y-2 pb-4">
          {otherPlayers.map((player, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-card-bg px-3 py-2 justify-between rounded-lg border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-white/40 font-bold text-xs w-4 italic">{player.rank || idx + 4}</span>
                <div className="rounded-full h-8 w-8 border border-white/10 bg-white/5 flex items-center justify-center">
                   <span className="material-symbols-outlined text-white/20 text-lg">person</span>
                </div>
                <p className="text-white text-xs font-semibold">{player.name}</p>
              </div>
              <p className="text-primary text-xs font-black italic">{Math.floor(player.score)} pts</p>
            </div>
          ))}

          {/* Tarjeta del Usuario Actual (Tú) */}
          <div className="flex items-center gap-3 bg-card-bg px-3 py-3 justify-between rounded-lg border-2 border-primary shadow-[0_0_10px_rgba(245,130,31,0.2)]">
            <div className="flex items-center gap-3">
              <span className="text-primary font-black text-sm italic">??</span>
              <div className="rounded-full h-10 w-10 border border-primary bg-white/10 flex items-center justify-center" style={{ borderColor: userColor || '#f5821f' }}>
                 <span className="material-symbols-outlined text-xl" style={{ color: userColor || '#f5821f', fontVariationSettings: "'FILL' 1" }}>{userIcon || 'person'}</span>
              </div>
              <p className="text-white text-sm font-black italic">{userName || 'Tú'}</p>
            </div>
            <p className="text-primary text-sm font-black italic">{Math.floor(userScore)} pts</p>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <div className="shrink-0 p-4 pb-8 z-20">
        <div className="bg-card-bg/80 backdrop-blur-2xl border border-primary/20 rounded-full h-14 flex items-center justify-around px-4 shadow-2xl">
          <button onClick={onBack} className="flex flex-col items-center justify-center text-white/50">
            <span className="material-symbols-outlined text-xl">home</span>
          </button>
          <button className="flex flex-col items-center justify-center text-primary relative">
            <span className="material-symbols-outlined text-xl fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"></div>
          </button>
          <button onClick={onProfile} className="flex flex-col items-center justify-center text-white/50">
            <span className="material-symbols-outlined text-xl">person</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ranking;