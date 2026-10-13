import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Star, 
  PhoneCall, 
  Mail, 
  Car, 
  Calendar, 
  Award, 
  CheckCircle2, 
  HeartHandshake,
  Route,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Logo } from './Logo';

interface ProfileViewProps {
  onOpenPublish: () => void;
  onExploreRides: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenPublish,
  onExploreRides,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Top Identity Card */}
      <div className="bg-[#131722] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar with Verified Ring */}
          <div className="relative shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" 
              alt="Miguel Ángel Cortez" 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-cyan-400 shadow-xl shadow-cyan-500/20"
            />
            <div 
              className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-xl p-1.5 border-3 border-[#131722] shadow-md flex items-center justify-center"
              title="Identidad Oficial DUI Verificada"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Miguel Ángel Cortez
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-xl border border-yellow-400/20 w-fit mx-auto sm:mx-0">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span>4.95 de 5.0</span>
              </span>
            </div>

            <p className="text-sm text-slate-300">
              Ingeniero de Software en <strong className="text-white">Tigo El Salvador / Torre Futura</strong>
            </p>

            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Viajo regularmente de San Salvador a Santa Ana por trabajo. Conduzco un Toyota RAV4 2023 con aire acondicionado y música tranquila.
            </p>

            {/* Badges of Trust */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                DUI Verificado
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
                <PhoneCall className="w-3.5 h-3.5" />
                +503 7842-1920 Verificado
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                Miembro desde Feb 2025
              </span>
            </div>

          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 text-center">
          <div className="p-3 rounded-2xl bg-[#0c1017] border border-white/5">
            <span className="text-xl sm:text-2xl font-display font-black text-white block">84</span>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Viajes Realizados</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0c1017] border border-white/5">
            <span className="text-xl sm:text-2xl font-display font-black text-cyan-300 block">0</span>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Cancelaciones</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0c1017] border border-white/5">
            <span className="text-xl sm:text-2xl font-display font-black text-emerald-400 block">100%</span>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Puntualidad</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0c1017] border border-white/5">
            <span className="text-xl sm:text-2xl font-display font-black text-white block">$294</span>
            <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">Gasolina Ahorrada</span>
          </div>
        </div>

      </div>

      {/* Verified Vehicle Section */}
      <div className="bg-[#131722] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">Vehículo Registrado</h2>
              <span className="text-xs text-slate-400">Datos verificados con tarjeta de circulación</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            Aprobado
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#0c1017] border border-white/5">
          <img 
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80" 
            alt="Toyota RAV4"
            className="w-full sm:w-36 h-24 object-cover rounded-xl"
          />
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-white">Toyota RAV4 XLE (2023)</h3>
            <p className="text-xs text-slate-400">Color: Gris Plata · Placa El Salvador: <strong className="text-white font-mono">P 849-210</strong></p>
            <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
              <span className="text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">Aire Acondicionado</span>
              <span className="text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">3 Asientos Libres</span>
              <span className="text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">Maletero Amplio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews by Fellow Salvadorans */}
      <div className="bg-[#131722] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-bold text-white">
            Reseñas de Pasajeros Verificados
          </h2>
          <span className="text-xs font-mono text-cyan-400">42 opiniones</span>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" 
                  alt="María José" 
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div>
                  <span className="text-xs font-bold text-white block">María José Ramos</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ruta San Salvador → Santa Ana</span>
                </div>
              </div>
              <span className="text-xs font-bold text-yellow-400">★ 5.0</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "Súper puntual. Me recogió en el punto acordado en Multiplaza y llegamos rápido por Los Chorros. Súper recomendado para los que viajan diario."
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" 
                  alt="Rodrigo Peña" 
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Rodrigo Peña</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ruta Santa Tecla → Lourdes Colón</span>
                </div>
              </div>
              <span className="text-xs font-bold text-yellow-400">★ 5.0</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "El carro está impecable y con excelente aire acondicionado. Viajar así ahorra muchísimo estrés comparado con el transporte público."
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onOpenPublish}
          className="min-h-[48px] py-3 px-6 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
        >
          <Car className="w-4 h-4" />
          <span>Publicar un Nuevo Trayecto</span>
        </button>

        <button
          onClick={onExploreRides}
          className="min-h-[48px] py-3 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#131722] hover:bg-[#1c2233] border border-white/10 flex items-center justify-center gap-2 transition-all"
        >
          <Route className="w-4 h-4 text-cyan-400" />
          <span>Buscar Asientos Disponibles</span>
        </button>
      </div>

    </div>
  );
};
