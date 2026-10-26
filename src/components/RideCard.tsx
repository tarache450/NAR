import React from 'react';
import { Ride } from '../types';
import { 
  Users, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Calendar
} from 'lucide-react';

interface RideCardProps {
  ride: Ride;
  onSelect: (ride: Ride) => void;
  onOpenLiveTelemetry?: (ride: Ride) => void;
}

export const RideCard: React.FC<RideCardProps> = ({ 
  ride, 
  onSelect, 
  onOpenLiveTelemetry 
}) => {
  const isLive = ride.status === 'in_progress';
  
  return (
    <article 
      className="group relative bg-[#131722] hover:bg-[#181d2b] border border-white/10 hover:border-[#315cff]/40 rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-xl shadow-black/40"
    >
      <div>
        
        {/* NIVEL 1: Ruta + Horario + Precio (Visual Scanning en 2 segundos) */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-white/10">
          
          {/* Timeline & Cities */}
          <div className="flex items-center gap-3 flex-1">
            
            {/* Origin & Departure */}
            <div>
              <span className="text-sm sm:text-lg font-display font-black text-white block whitespace-nowrap">
                {ride.departureTime}
              </span>
              <span className="text-xs font-semibold text-slate-300 block truncate max-w-[120px] sm:max-w-[140px]">
                {ride.origin.city}
              </span>
              <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">
                {ride.origin.name.split(' ')[0]}
              </span>
            </div>

            {/* Dotted Route Vector Indicator */}
            <div className="flex flex-col items-center px-1">
              <span className="text-[10px] font-mono text-[#9cb3ff] font-bold mb-0.5">
                {ride.estimatedDuration}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-8 sm:w-12 h-0.5 border-t border-dashed border-[#315cff]/60" />
                <div className="w-2 h-2 rounded-xs bg-[#315cff]" />
              </div>
              {ride.waypoints.length > 0 && (
                <span className="text-[9px] text-slate-400 mt-0.5">
                  1 parada
                </span>
              )}
            </div>

            {/* Destination & Arrival */}
            <div>
              <span className="text-sm sm:text-lg font-display font-black text-white block whitespace-nowrap">
                {ride.arrivalTime}
              </span>
              <span className="text-xs font-semibold text-slate-300 block truncate max-w-[120px] sm:max-w-[140px]">
                {ride.destination.city}
              </span>
              <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">
                {ride.destination.name.split(' ')[0]}
              </span>
            </div>

          </div>

          {/* Pricing Highlight in USD ($) */}
          <div className="text-right shrink-0">
            <span className="text-xl sm:text-2xl font-display font-black text-[#c4cfff] block">
              ${ride.seatPrice.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              / asiento
            </span>
          </div>

        </div>

        {/* Intermediate Corridor Stops (Central to NAR's Waypoint Matching) */}
        {ride.waypoints && ride.waypoints.length > 0 && (
          <div className="mb-3.5 px-3 py-1.5 rounded-xl bg-[#0c0f17] border border-white/5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#315cff] shrink-0" />
              <span className="text-slate-400 font-mono text-[10px]">Puntos en ruta:</span>
              <span className="font-medium text-white truncate">
                {ride.waypoints.map(w => `${w.city} (${w.name.split(' ')[0]})`).join(' · ')}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono shrink-0 ml-2 font-semibold">
              Admite paradas
            </span>
          </div>
        )}

        {/* NIVEL 2: Persona + Vehículo + Confianza */}
        <div className="flex items-center justify-between gap-3 mb-4">
          
          {/* Driver Credentials */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img 
                src={ride.driver.avatar} 
                alt={ride.driver.name} 
                loading="lazy"
                decoding="async"
                className="w-10 h-10 rounded-2xl object-cover border border-white/20 group-hover:border-[#315cff] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#c4cfff] transition-colors">
                  Conductor de ejemplo
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Perfil de ejemplo
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                {ride.vehicle.make} {ride.vehicle.model.split(' ')[0]} · {ride.vehicle.color}
              </span>
            </div>
          </div>

          {/* Seats Left Pill */}
          <div className="text-right">
            <span className={`text-[10px] sm:text-[11px] whitespace-nowrap font-mono font-bold px-2.5 py-1 rounded-xl border ${
              ride.availableSeats === 1 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {ride.availableSeats} {ride.availableSeats === 1 ? 'plaza restante' : 'plazas libres'}
            </span>
          </div>

        </div>

        {/* NIVEL 3: Detalles Secundarios (Chips limpios) */}
        <div className="flex items-center gap-1.5 flex-wrap mb-5">
          {ride.amenities.slice(0, 3).map((amenity, idx) => (
            <span 
              key={idx}
              className="text-[10px] text-slate-300 bg-[#0c0f17] border border-white/5 px-2.5 py-0.5 rounded-lg font-medium"
            >
              {amenity}
            </span>
          ))}
        </div>

      </div>

      {/* NIVEL 4: Acción Principal Clara */}
      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(ride);
          }}
          className="flex-1 min-h-[42px] py-2 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#315cff] to-[#00a89d] hover:from-[#4d77ff] hover:to-[#22c4b7] shadow-md shadow-[#315cff]/15 flex items-center justify-center gap-2 transition-all transform active:scale-98"
        >
          <span>Ver detalles de ejemplo</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {isLive && onOpenLiveTelemetry && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLiveTelemetry(ride);
            }}
            className="min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-[#c4cfff] bg-white/5 hover:bg-white/10 border border-cyan-500/30 flex items-center gap-1.5"
            title="Ver recorrido de ejemplo"
          >
            <MapPin className="w-3.5 h-3.5 text-[#9cb3ff]" />
            <span className="hidden sm:inline">Mapa</span>
          </button>
        )}
      </div>

    </article>
  );
};
