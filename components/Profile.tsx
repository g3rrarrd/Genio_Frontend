import React, { useState } from 'react';
import { audioManager } from '../audio';

interface ProfileProps {
  user: any; // Aquí vendrán los datos de tbl_usuario
  onUpdate: (updatedData: any) => Promise<void>; // Función para actualizar datos del usuario
  onLogout: () => void;
  onDelete: () => void; // Esta función ahora desactivará la cuenta
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onLogout, onDelete, onBack }) => {
  const [description, setDescription] = useState(user.descripcion || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const avatarOptions = [
    { name: 'Balón', icon: 'sports_soccer', color: '#f5821f' },
    { name: 'Corona', icon: 'crown', color: '#f4f425' },
    { name: 'Estrella', icon: 'grade', color: '#a855f7' },
    { name: 'Rayo', icon: 'bolt', color: '#f20d0d' }
  ];

  const handleSaveBio = async () => {
    audioManager.play('click');
    onUpdate({ descripcion: description });
    setIsEditing(false);
  };

  const handleEmblemaSelect = async (icon: string) => {
  if (user.emblema === icon || isUpdating) return;
      
      audioManager.play('click');
      setIsUpdating(true); // Iniciamos carga
      try {
        await onUpdate({ emblema: icon });
      } finally {
        setIsUpdating(false); // Quitamos carga
      }
  };

  const currentEmblemaColor = avatarOptions.find(o => o.icon === user.emblema)?.color || '#f5821f';

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto relative overflow-hidden bg-background-dark soccer-pattern">
      <header className="pt-6 flex items-center justify-between mb-8 z-10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-xl font-black italic uppercase text-primary">Perfil de Crack</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 space-y-8 z-10">
        {/* Card de Jugador */}
        <div className="relative bg-card-bg rounded-3xl border-2 border-primary overflow-hidden shadow-[0_0_30px_rgba(245,130,31,0.2)]">
          <div className="p-8 pt-12 flex flex-col items-center relative">
            
            {/* AVATAR PRINCIPAL CON OVERLAY DE CARGA */}
            <div 
              className="relative w-32 h-32 rounded-full border-4 flex items-center justify-center bg-white/5 mb-4 transition-all duration-500"
              style={{ borderColor: currentEmblemaColor, boxShadow: `0 0 20px ${currentEmblemaColor}40` }}
            >
              {isUpdating && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background-dark/60 rounded-full backdrop-blur-[2px]">
                   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <span className="material-symbols-outlined text-7xl" style={{ color: currentEmblemaColor, fontVariationSettings: "'FILL' 1" }}>
                {user.emblema || 'person'}
              </span>
            </div>
            
            <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-1">{user.identificador}</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-6">{user.correo}</p>

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/30 px-2">
                <span>Descripción</span>
                <button 
                  disabled={isUpdating}
                  onClick={() => setIsEditing(!isEditing)} 
                  className={`text-primary ${isUpdating ? 'opacity-50' : ''}`}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <textarea 
                    value={description}
                    disabled={isUpdating}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white h-24 resize-none focus:border-primary disabled:opacity-50"
                    maxLength={100}
                  />
                  <button 
                    onClick={handleSaveBio} 
                    disabled={isUpdating}
                    className="w-full bg-primary text-background-dark font-black py-3 rounded-xl text-xs uppercase italic flex items-center justify-center gap-2"
                  >
                    {isUpdating && <div className="w-4 h-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>}
                    {isUpdating ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                  </button>
                </div>
              ) : (
                <p className="bg-white/5 rounded-2xl p-4 text-sm text-white/80 italic border border-white/5 min-h-[80px]">
                  {user.descripcion || "¡Escribe algo sobre tu estilo de juego!"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Selector de Emblema con Feedback */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] ml-2">Cambiar Emblema</h3>
          <div className="grid grid-cols-4 gap-3">
            {avatarOptions.map((option) => (
              <button
                key={option.name}
                disabled={isUpdating}
                onClick={() => handleEmblemaSelect(option.icon)}
                className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all ${
                  user.emblema === option.icon 
                    ? 'bg-white/10 border-primary shadow-[0_0_15px_rgba(245,130,31,0.2)]' 
                    : 'bg-card-bg border-white/5 active:scale-90'
                } ${isUpdating ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="w-10 h-10 rounded-full mb-2 flex items-center justify-center" style={{ backgroundColor: `${option.color}20` }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: option.color }}>{option.icon}</span>
                </div>
                <span className="text-[8px] font-black uppercase text-white/60">{option.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Botones de Acción */}
        <section className="space-y-3">
          <button onClick={onLogout} className="w-full flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-sm font-bold uppercase text-white/80">Cerrar Sesión</span>
            <span className="material-symbols-outlined text-white/20">logout</span>
          </button>

          <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between px-6 py-4 bg-danger/5 border border-danger/20 rounded-2xl">
            <span className="text-sm font-bold uppercase text-danger/80">Desactivar Cuenta</span>
            <span className="material-symbols-outlined text-danger/20">person_off</span>
          </button>
        </section>
      </main>

      {/* Modal Desactivar (Retiro) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background-dark/95 backdrop-blur-sm">
          <div className="bg-card-bg border border-danger/30 rounded-3xl p-8 max-w-xs text-center space-y-6">
            <h4 className="text-xl font-black italic text-white uppercase">¿Colgar las botas?</h4>
            <p className="text-xs text-white/50 uppercase font-bold leading-relaxed">
              Tu cuenta se desactivará y no aparecerás en el ranking hasta que vuelvas a entrar.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={onDelete} className="w-full bg-danger text-white font-black py-4 rounded-xl text-xs uppercase italic">Confirmar Retiro</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-white/10 text-white/60 font-black py-4 rounded-xl text-xs uppercase italic">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;