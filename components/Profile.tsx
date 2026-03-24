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
  const [phone, setPhone] = useState(user.telefono || '');
  const [apostemos, setApostemos] = useState(user.recibir_apostemos || false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const avatarOptions = [
    { name: 'Balón', icon: 'sports_soccer', color: '#f5821f' },
    { name: 'Corona', icon: 'crown', color: '#f4f425' },
    { name: 'Estrella', icon: 'grade', color: '#a855f7' },
    { name: 'Rayo', icon: 'bolt', color: '#f20d0d' }
  ];

  const handleSaveInfo = async () => {
    audioManager.play('click');
    setIsUpdating(true);
    try {
      await onUpdate({ telefono: phone, recibir_apostemos: apostemos });
    } finally {
      setIsUpdating(false);
      setIsEditingInfo(false);
    }
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
    <div className="min-h-[100dvh] flex flex-col p-4 sm:p-6 lg:p-10 3xl:p-14 4k:p-20 max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl 4k:max-w-6xl mx-auto relative overflow-x-hidden bg-background-dark soccer-pattern">
      <header className="pt-4 sm:pt-6 lg:pt-8 flex items-center justify-between mb-6 sm:mb-8 lg:mb-10 z-10">
        <button onClick={onBack} className="w-10 h-10 lg:w-12 lg:h-12 3xl:w-16 3xl:h-16 4k:w-20 4k:h-20 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="material-symbols-outlined text-white lg:text-xl 3xl:text-2xl 4k:text-3xl">arrow_back</span>
        </button>
        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl 3xl:text-4xl 4k:text-5xl font-black italic uppercase text-primary">Perfil de Crack</h1>
        <div className="w-10 lg:w-12 3xl:w-16 4k:w-20"></div>
      </header>

      <main className="flex-1 space-y-6 sm:space-y-8 lg:space-y-10 3xl:space-y-14 4k:space-y-18 z-10">
        {/* Card de Jugador */}
        <div className="relative bg-card-bg rounded-3xl border-2 border-primary overflow-hidden shadow-[0_0_30px_rgba(245,130,31,0.2)]">
          <div className="p-6 sm:p-8 pt-10 sm:pt-12 lg:p-10 lg:pt-14 3xl:p-14 3xl:pt-18 4k:p-20 4k:pt-24 flex flex-col items-center relative">
            
            {/* AVATAR PRINCIPAL CON OVERLAY DE CARGA */}
            <div 
              className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 3xl:w-60 3xl:h-60 4k:w-80 4k:h-80 rounded-full border-4 flex items-center justify-center bg-white/5 mb-4 3xl:mb-6 4k:mb-8 transition-all duration-500"
              style={{ borderColor: currentEmblemaColor, boxShadow: `0 0 20px ${currentEmblemaColor}40` }}
            >
              {isUpdating && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-background-dark/60 rounded-full backdrop-blur-[2px]">
                   <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <span className="material-symbols-outlined text-5xl sm:text-7xl lg:text-8xl 3xl:text-9xl 4k:text-[10rem]" style={{ color: currentEmblemaColor, fontVariationSettings: "'FILL' 1" }}>
                {user.emblema || 'person'}
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl 3xl:text-5xl 4k:text-6xl font-black italic uppercase text-white tracking-tighter mb-1">{user.identificador}</h2>
            <p className="text-white/40 text-[10px] sm:text-xs lg:text-sm 3xl:text-base 4k:text-lg font-bold uppercase tracking-[0.2em] mb-4 sm:mb-6 3xl:mb-8 4k:mb-10">{user.correo}</p>

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-[10px] 3xl:text-sm 4k:text-base font-black uppercase text-white/30 px-2">
                <span>Contacto</span>
                <button
                  disabled={isUpdating}
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                  className={`text-primary ${isUpdating ? 'opacity-50' : ''}`}
                >
                  {isEditingInfo ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {isEditingInfo ? (
                <div className="space-y-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">phone</span>
                    <input
                      type="tel"
                      value={phone}
                      disabled={isUpdating}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 3xl:p-6 pl-12 text-sm 3xl:text-base text-white focus:border-primary disabled:opacity-50 placeholder:text-white/20 focus:outline-none"
                    />
                  </div>
                  <label htmlFor="profile-apostemos" className="flex items-start gap-3 cursor-pointer px-1">
                    <input
                      id="profile-apostemos"
                      type="checkbox"
                      checked={apostemos}
                      onChange={e => setApostemos(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors pointer-events-none ${
                        apostemos ? 'bg-primary border-primary' : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {apostemos && (
                        <span className="material-symbols-outlined text-sm text-background-dark" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/50 font-bold uppercase leading-relaxed">
                      Recibir información digital de <span className="text-primary">Apostemos</span>
                    </span>
                  </label>
                  <button
                    onClick={handleSaveInfo}
                    disabled={isUpdating}
                    className="w-full bg-primary text-background-dark font-black py-3 3xl:py-5 rounded-xl text-xs 3xl:text-base uppercase italic flex items-center justify-center gap-2"
                  >
                    {isUpdating && <div className="w-4 h-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>}
                    {isUpdating ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                  </button>
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-4 3xl:p-6 border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary/40">phone</span>
                    <span className="text-sm 3xl:text-base text-white/70">
                      {user.telefono || <span className="italic text-white/30">Sin teléfono registrado</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color: user.recibir_apostemos ? '#f97316' : 'rgba(255,255,255,0.2)', fontVariationSettings: "'FILL' 1" }}
                    >check_circle</span>
                    <span className="text-[10px] 3xl:text-sm text-white/50 font-bold uppercase">
                      {user.recibir_apostemos ? 'Recibe info de Apostemos' : 'No recibe info de Apostemos'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selector de Emblema con Feedback */}
        <section className="space-y-4">
          <h3 className="text-[10px] 3xl:text-sm 4k:text-base font-black uppercase text-white/40 tracking-[0.2em] ml-2">Cambiar Emblema</h3>
          <div className="grid grid-cols-4 gap-3 3xl:gap-5 4k:gap-6">
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
                <div className="w-10 h-10 lg:w-14 lg:h-14 3xl:w-20 3xl:h-20 4k:w-24 4k:h-24 rounded-full mb-2 flex items-center justify-center" style={{ backgroundColor: `${option.color}20` }}>
                  <span className="material-symbols-outlined text-2xl lg:text-3xl 3xl:text-4xl 4k:text-5xl" style={{ color: option.color }}>{option.icon}</span>
                </div>
                <span className="text-[8px] lg:text-[10px] 3xl:text-sm 4k:text-base font-black uppercase text-white/60">{option.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Botones de Acción */}
        <section className="space-y-3">
          <button onClick={onLogout} className="w-full flex items-center justify-between px-4 sm:px-6 3xl:px-8 4k:px-10 py-3 sm:py-4 lg:py-5 3xl:py-6 4k:py-8 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-xs sm:text-sm lg:text-base 3xl:text-lg 4k:text-xl font-bold uppercase text-white/80">Cerrar Sesión</span>
            <span className="material-symbols-outlined text-white/20 3xl:text-xl 4k:text-2xl">logout</span>
          </button>

          <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between px-4 sm:px-6 3xl:px-8 4k:px-10 py-3 sm:py-4 lg:py-5 3xl:py-6 4k:py-8 bg-danger/5 border border-danger/20 rounded-2xl">
            <span className="text-xs sm:text-sm lg:text-base 3xl:text-lg 4k:text-xl font-bold uppercase text-danger/80">Desactivar Cuenta</span>
            <span className="material-symbols-outlined text-danger/20 3xl:text-xl 4k:text-2xl">person_off</span>
          </button>
        </section>
      </main>

      {/* Modal Desactivar (Retiro) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background-dark/95 backdrop-blur-sm">
          <div className="bg-card-bg border border-danger/30 rounded-3xl p-6 sm:p-8 lg:p-10 3xl:p-14 4k:p-18 max-w-xs lg:max-w-sm 3xl:max-w-lg 4k:max-w-xl text-center space-y-4 sm:space-y-6 3xl:space-y-8 4k:space-y-10">
            <h4 className="text-xl 3xl:text-2xl 4k:text-3xl font-black italic text-white uppercase">¿Colgar las botas?</h4>
            <p className="text-xs 3xl:text-base 4k:text-lg text-white/50 uppercase font-bold leading-relaxed">
              Tu cuenta se desactivará y no aparecerás en el ranking hasta que vuelvas a entrar.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={onDelete} className="w-full bg-danger text-white font-black py-4 3xl:py-6 4k:py-8 rounded-xl text-xs 3xl:text-base 4k:text-lg uppercase italic">Confirmar Retiro</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="w-full bg-white/10 text-white/60 font-black py-4 3xl:py-6 4k:py-8 rounded-xl text-xs 3xl:text-base 4k:text-lg uppercase italic">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;