import React, { useState } from 'react';
import { audioManager } from '../../audio';
import { User } from '../../types';
import { db } from '../db';
import { getActiveDesignCode } from './adminDesignStore';

interface RegisterProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', apostemos: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    audioManager.play('click');
    setIsLoading(true);
    setError(null);

    const baseURL = import.meta.env.VITE_API_URL;

    try {
        const response = await fetch(`${baseURL}usuarios/acceso_directo/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identificador: formData.name,
                email: formData.email,
                telefono: formData.phone,
                recibir_apostemos: formData.apostemos
            }),
        });

        const data = await response.json();

        if (response.ok || response.status === 201) {
            // 1. Mapear la respuesta al esquema de tbl_usuario de tu db.ts
            const userForDb = {
                identificador: data.identificador || formData.name,
                correo: data.email || formData.email,
                telefono: data.telefono || formData.phone,
                estado: data.estado || 'activo',
                fecha_creacion: new Date().toISOString(),
                permisos: data.permisos || 'jugador',
                codigo_diseno: getActiveDesignCode() || ''
            };

            // 2. Guardar en Dexie (Offline-First)
            // Usamos put para que si el usuario ya existe (basado en id_usuario si viene en data), lo actualice.
            await db.tbl_usuario.put(userForDb);

            // 3. Objeto para el estado de la App (incluyendo campos visuales)
            const userToSave = {
                ...userForDb,
                name: userForDb.identificador, 
                avatarColor: '#f5821f',
                avatarIcon: 'sports_soccer'
            };

            // Mantener localStorage como respaldo rápido si lo deseas
            localStorage.setItem('mundialista_user', JSON.stringify(userToSave));
            
            audioManager.play('whistle');
            onSuccess(userToSave);
        } else {
            const errorMsg = data.correo ? "Este correo ya está registrado" : 
                             data.identificador ? "Este nombre ya está en uso" : 
                             "Error al entrar al campo";
            setError(errorMsg);
        }
    } catch (err) {
        console.error("Error en el registro:", err);
        setError('El vestuario está cerrado (Error de conexión)');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 sm:p-6 lg:p-10 3xl:p-14 4k:p-20 max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl 3xl:max-w-4xl 4k:max-w-6xl mx-auto bg-background-dark soccer-pattern overflow-x-hidden">
      <header className="pt-8 sm:pt-12 lg:pt-14 text-center mb-8 sm:mb-12 relative">
        <button 
          onClick={onBack}
          className="absolute top-0 left-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 3xl:w-16 3xl:h-16 4k:w-20 4k:h-20 flex items-center justify-center rounded-full bg-danger/10 border border-danger/30 text-danger active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl 4k:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
          NUEVO <br/>
          <span className="text-primary drop-shadow-[0_0_15px_rgba(245,130,31,0.4)]">FICHAJE</span>
        </h1>
        <p className="text-white/40 text-[10px] sm:text-xs lg:text-sm 3xl:text-lg 4k:text-xl font-bold uppercase mt-3 sm:mt-4 3xl:mt-6 4k:mt-8 tracking-wider px-4 sm:px-8">
          Crea tu perfil de crack para empezar a competir
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 space-y-4 sm:space-y-5 lg:space-y-6 3xl:space-y-8 4k:space-y-10 overflow-y-auto no-scrollbar pb-6 sm:pb-8">
        {error && (
          <div className="bg-danger/10 border border-danger/50 text-danger p-3 rounded-xl text-center text-[10px] font-black uppercase animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] sm:text-[10px] lg:text-xs 3xl:text-sm 4k:text-base font-black uppercase text-white/40 tracking-[0.2em] ml-2">Nombre de Usuario</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 3xl:left-6 4k:left-8 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-2xl">sports_soccer</span>
            <input 
              type="text" 
              required
              placeholder="Ej: Pelé_10"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-3 sm:py-4 lg:py-5 3xl:py-6 4k:py-8 pl-12 3xl:pl-14 4k:pl-16 pr-4 text-sm sm:text-base 3xl:text-lg 4k:text-xl text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] sm:text-[10px] lg:text-xs 3xl:text-sm 4k:text-base font-black uppercase text-white/40 tracking-[0.2em] ml-2">Email del Jugador</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 3xl:left-6 4k:left-8 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-2xl">mail</span>
            <input 
              type="email" 
              required
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-3 sm:py-4 lg:py-5 3xl:py-6 4k:py-8 pl-12 3xl:pl-14 4k:pl-16 pr-4 text-sm sm:text-base 3xl:text-lg 4k:text-xl text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] sm:text-[10px] lg:text-xs 3xl:text-sm 4k:text-base font-black uppercase text-white/40 tracking-[0.2em] ml-2">Teléfono</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 3xl:left-6 4k:left-8 top-1/2 -translate-y-1/2 text-primary/40 3xl:text-xl 4k:text-2xl">phone</span>
            <input 
              type="tel"
              placeholder="+57 300 000 0000"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-card-bg border border-white/10 rounded-2xl py-3 sm:py-4 lg:py-5 3xl:py-6 4k:py-8 pl-12 3xl:pl-14 4k:pl-16 pr-4 text-sm sm:text-base 3xl:text-lg 4k:text-xl text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <label htmlFor="auth-apostemos" className="flex items-start gap-3 cursor-pointer px-1">
          <input
            id="auth-apostemos"
            type="checkbox"
            checked={formData.apostemos}
            onChange={e => setFormData({...formData, apostemos: e.target.checked})}
            className="sr-only"
          />
          <div
            className={`mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors pointer-events-none ${
              formData.apostemos ? 'bg-primary border-primary' : 'border-white/20 bg-white/5'
            }`}
          >
            {formData.apostemos && (
              <span className="material-symbols-outlined text-sm text-background-dark" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs 3xl:text-sm 4k:text-base text-white/50 font-bold uppercase leading-relaxed">
            Quiero recibir información digital de <span className="text-primary">Apostemos</span>
          </span>
        </label>

        <div className="pt-4">
            <button 
                type="submit"
                disabled={isLoading}
                className={`w-full bg-primary text-background-dark font-black py-4 sm:py-5 lg:py-6 3xl:py-8 4k:py-10 rounded-2xl shadow-[0_10px_30px_rgba(245,130,31,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter text-lg sm:text-xl lg:text-2xl 3xl:text-3xl 4k:text-4xl italic ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
                {isLoading ? 'FIRMANDO CONTRATO...' : 'SALTAR AL CAMPO'}
                <span className="material-symbols-outlined font-black">app_registration</span>
            </button>
            <p className="text-center text-[9px] 3xl:text-sm 4k:text-base text-white/20 uppercase font-bold mt-4 tracking-widest px-8">
                Al registrarte, aceptas las reglas del juego limpio.
            </p>
        </div>
      </form>
    </div>
  );
};

export default Register;