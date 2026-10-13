import React, { useState, useEffect } from 'react';
import { Ride } from '../types';
import { 
  Radio, 
  ShieldCheck, 
  Zap, 
  Clock, 
  MapPin, 
  Users, 
  MessageSquare, 
  QrCode, 
  AlertTriangle, 
  Navigation, 
  Share2, 
  Gauge,
  PhoneCall,
  CheckCircle2,
  Car
} from 'lucide-react';

interface LiveTelemetryViewProps {
  ride: Ride;
  onOpenPass: () => void;
  onOpenChat: () => void;
}

export const LiveTelemetryView: React.FC<LiveTelemetryViewProps> = ({
  ride,
  onOpenPass,
  onOpenChat,
}) => {
  const [speed, setSpeed] = useState<number>(72);
  const [currentProgress, setCurrentProgress] = useState<number>(55);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.round(Math.min(88, Math.max(60, prev + delta)));
      });
      setCurrentProgress(prev => Math.min(95, prev + 0.2));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleShareTrip = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Telemetry Header Bar */}
      <div className="bg-[#131722] border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-[#0c0f17] border border-cyan-400/30 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400 font-bold">
                MONITOREO DE RUTA EN TIEMPO REAL
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] text-slate-400 font-mono">CA-1 Panamericana</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black text-white mt-0.5">
              {ride.origin.city} → {ride.destination.city}
            </h2>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={onOpenChat}
            className="min-h-[42px] flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#1c2233] hover:bg-[#252d42] text-white border border-white/10 transition-colors shadow-md"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Chat con Conductor ({ride.passengers.length + 1})</span>
          </button>

          <button
            onClick={onOpenPass}
            className="min-h-[42px] flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 shadow-md shadow-cyan-500/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Pase Digital QR</span>
          </button>

          <button
            onClick={handleShareTrip}
            className="min-h-[42px] flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0c0f17] hover:bg-[#181d2a] text-slate-300 border border-white/10 transition-colors"
          >
            <Share2 className="w-4 h-4 text-slate-400" />
            <span>{copiedLink ? '¡Enlace Copiado!' : 'Compartir con Familiar'}</span>
          </button>

          <button
            onClick={() => setSosActive(!sosActive)}
            className={`min-h-[42px] flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors ${
              sosActive
                ? 'bg-rose-950 text-rose-200 border-rose-500'
                : 'bg-[#0c0f17] text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{sosActive ? 'S.O.S. Monitoreado' : 'Botón S.O.S.'}</span>
          </button>
        </div>
      </div>

      {/* Main Kinetic Screen: Cartographic Vector Visualizer + Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Visual Map & Progress */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="relative bg-[#131722] border border-white/10 rounded-3xl overflow-hidden p-6 min-h-[380px] flex flex-col justify-between shadow-2xl">
            
            {/* Background Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px), radial-gradient(#3b82f6 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                backgroundPosition: '0 0, 14px 14px'
              }}
            />

            {/* Live Map Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono text-slate-300">
                  GPS EL SALVADOR · 13.6929° N, -89.2182° W
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-[#0c0f17] px-3 py-1 rounded-xl border border-white/10">
                TRÁFICO FLUIDO EN CARRETERA
              </span>
            </div>

            {/* Continuous Kinetic Vector Path Diagram (Ref 1 & Ref 3) */}
            <div className="relative z-10 my-8 py-4">
              
              {/* Path Line */}
              <div className="relative h-2.5 bg-[#0c0f17] rounded-full overflow-hidden border border-white/5">
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>

              {/* Waypoint Nodes along the path */}
              <div className="relative flex justify-between items-center -mt-4">
                
                {/* Node 1: Origin (San Salvador) */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-amber-400 border-4 border-[#131722] shadow-md flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#131722]" />
                  </div>
                  <span className="text-xs font-bold text-white mt-2 block">{ride.origin.city}</span>
                  <span className="text-[10px] font-mono text-slate-400">{ride.origin.time} · Salida</span>
                </div>

                {/* Node 2: Intermediate (Santa Tecla) */}
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-cyan-400 border-3 border-[#131722] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#131722]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 mt-2 block">Santa Tecla</span>
                  <span className="text-[10px] font-mono text-cyan-300">Completada</span>
                </div>

                {/* Moving Vehicle Node (Current Realtime Position) */}
                <div 
                  className="absolute -top-4 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000"
                  style={{ left: `${currentProgress}%` }}
                >
                  <div className="relative w-9 h-9 rounded-full bg-cyan-400 border-2 border-white shadow-xl shadow-cyan-400/50 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-slate-950 transform rotate-45" />
                  </div>
                  <div className="bg-[#0c0f17] border border-cyan-400/40 px-2 py-0.5 rounded-lg text-[10px] font-mono text-cyan-300 mt-1 whitespace-nowrap shadow-lg">
                    {speed} km/h · En ruta
                  </div>
                </div>

                {/* Node 3: Destination (Santa Ana) */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 border-4 border-[#131722] shadow-md flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#131722]" />
                  </div>
                  <span className="text-xs font-bold text-white mt-2 block">{ride.destination.city}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{ride.arrivalTime} · Llegada</span>
                </div>

              </div>
            </div>

            {/* Bottom Live Metrics */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
              <div className="p-3 rounded-2xl bg-[#0c0f17] border border-white/10">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Velocidad Actual</span>
                </div>
                <div className="text-xl font-display font-extrabold text-white mt-1">
                  {speed} <span className="text-xs font-normal text-slate-400">km/h</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">Conducción segura</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#0c0f17] border border-white/10">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hora de Llegada</span>
                </div>
                <div className="text-xl font-display font-extrabold text-white mt-1">
                  {ride.arrivalTime}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Tiempo estimado en punto</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#0c0f17] border border-white/10">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Vehículo</span>
                </div>
                <div className="text-sm font-display font-bold text-white mt-1 truncate">
                  {ride.vehicle.model.split(' ')[0]}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{ride.vehicle.plate}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#0c0f17] border border-white/10">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seguridad</span>
                </div>
                <div className="text-sm font-display font-bold text-emerald-400 mt-1">
                  DUI Activo
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ruta compartida segura</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Col: Driver & Passenger Manifest (Ref 1 Style) */}
        <div className="space-y-6">
          
          {/* Driver Card */}
          <div className="bg-[#131722] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block mb-3">
              Conductor del Trayecto
            </span>

            <div className="flex items-center gap-3.5 mb-4">
              <img 
                src={ride.driver.avatar} 
                alt={ride.driver.name} 
                className="w-13 h-13 rounded-2xl object-cover border-2 border-cyan-400/40"
              />
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {ride.driver.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {ride.driver.role}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-yellow-400 mt-1 font-semibold">
                  <span>★ {ride.driver.rating.toFixed(2)}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{ride.driver.totalTrips} viajes en NAR</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#0c0f17] border border-white/5 text-xs text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Nota del conductor:</span>
              <p className="mt-0.5 italic">"{ride.notes || 'Buen viaje a todos.'}"</p>
            </div>
          </div>

          {/* Passenger Cabin Manifest */}
          <div className="bg-[#131722] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400">
                Manifiesto de Cabina ({ride.passengers.length + 1}/{ride.totalSeats + 1})
              </span>
              <span className="text-xs font-mono text-cyan-300 font-bold">Plazas Asignadas</span>
            </div>

            <div className="space-y-2.5">
              {/* Driver */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0f17] border border-white/5">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={ride.driver.avatar} 
                    alt={ride.driver.name} 
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">{ride.driver.name.split(' ')[0]} (Conductor)</span>
                    <span className="text-[10px] text-slate-400">Punto de partida</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-white/5 px-2 py-0.5 rounded">
                  Piloto
                </span>
              </div>

              {/* Passenger rows */}
              {ride.passengers.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0c0f17] border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={p.avatar} 
                      alt={p.name} 
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px] block">{p.pickupPoint}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Asiento #{p.seatNumber}
                  </span>
                </div>
              ))}

              {/* Free seat indicator */}
              {ride.availableSeats > 0 && (
                <div className="p-3 rounded-xl border border-dashed border-white/10 text-center">
                  <span className="text-xs text-slate-400">
                    {ride.availableSeats} {ride.availableSeats === 1 ? 'asiento disponible' : 'asientos disponibles'}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
