import React, { useState } from 'react';
import { AvatarGroupHover } from './AvatarGroupHover';
import { Ride } from '../types';
import { googleMapsDirectionsUrl } from '../lib/maps';
import { 
  X, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  CreditCard,
  Phone,
  MessageCircle,
  Car,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RideDetailModalProps {
  ride: Ride;
  onClose: () => void;
  onBookSuccess: (ride: Ride, seatNumber: number) => void;
}

export const RideDetailModal: React.FC<RideDetailModalProps> = ({
  ride,
  onClose,
  onBookSuccess,
}) => {
  const [selectedSeatCount, setSelectedSeatCount] = useState<number>(1);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  const totalPrice = ride.seatPrice * selectedSeatCount;
  const mapsUrl = googleMapsDirectionsUrl(ride);

  const handleConfirm = () => {
    setIsBooking(true);
    setTimeout(() => {
      onBookSuccess(ride, selectedSeatCount);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#131722] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar detalle de ruta"
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-[#0c0f17]/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header: Driver Banner (Ref 1 Style) */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1c2233] to-[#131722] border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            
            {/* Driver Profile */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={ride.driver.avatar}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#315cff]/40 shadow-lg shadow-[#315cff]/10"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-display font-extrabold text-white">
                    Conductor de ejemplo
                  </h2>
                  <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">Perfil de ejemplo</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conduce un <strong className="text-white">{ride.vehicle.make} {ride.vehicle.model}</strong> ({ride.vehicle.color})
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 mt-1 font-medium">
                  <span className="text-slate-400">Vehículo y datos ilustrativos</span>
                </div>
              </div>
            </div>

            {/* Price Badge */}
            <div className="text-right shrink-0">
              <span className="text-2xl font-display font-black text-[#c4cfff] block">
                ${ride.seatPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">por persona</span>
            </div>

          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Route Stopovers (Ref 1 Style with Amber & Cyan Icons) */}
          <div className="p-4 rounded-2xl bg-[#0c0f17] border border-white/10">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-3">
              Recorrido Planificado
            </span>

            <div className="space-y-4 relative">
              {/* Vertical connector line */}
              <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-amber-400 via-cyan-400 to-emerald-400" />

              {/* Origin */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center shrink-0 mt-0.5 bg-[#0c0f17]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white">{ride.origin.name}</span>
                    <span className="text-xs font-mono font-semibold text-amber-400">{ride.departureTime}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ride.origin.address}</p>
                </div>
              </div>

              {/* Waypoints */}
              {ride.waypoints.map((wp) => (
                <div key={wp.id} className="flex items-start gap-3 relative z-10">
                  <div className="w-5 h-5 rounded-full bg-[#315cff]/20 border-2 border-[#315cff] flex items-center justify-center shrink-0 mt-0.5 bg-[#0c0f17]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#315cff]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs sm:text-sm font-semibold text-slate-200">{wp.name}</span>
                      <span className="text-xs font-mono text-[#c4cfff]">{wp.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{wp.address}</p>
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-start gap-3 relative z-10">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 border-2 border-emerald-400 flex items-center justify-center shrink-0 mt-0.5 bg-[#0c0f17]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white">{ride.destination.name}</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">{ride.arrivalTime}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ride.destination.address}</p>
                </div>
              </div>

            </div>
          </div>

            {/* Sample passenger data */}
          <div>
            <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-400 block mb-2.5">
              Pasajeros de ejemplo ({ride.passengers.length}/{ride.totalSeats})
            </span>

            {ride.passengers.length > 0 ? (
              <AvatarGroupHover className="flex flex-wrap items-center gap-3">
                {ride.passengers.map((pas) => (
                  <div key={pas.id} className="flex items-center gap-2 p-2 rounded-xl bg-[#0c0f17] border border-white/5">
                    <img 
                      src={pas.avatar} 
                      alt={pas.name} 
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <div className="text-left pr-2">
                      <span className="text-xs font-bold text-white block">Ejemplo</span>
                      <span className="text-[9px] text-slate-400 font-mono">Asiento {pas.seatNumber}</span>
                    </div>
                  </div>
                ))}
              </AvatarGroupHover>
            ) : (
              <p className="text-xs text-slate-500 italic p-2 bg-[#0c0f17] rounded-xl border border-white/5">
                No hay pasajeros reales: esta lista pertenece a la demostración.
              </p>
            )}
          </div>

          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#9cb3ff]/25 bg-[#315cff]/10 px-4 text-sm font-semibold text-[#c4cfff] hover:bg-[#315cff]/20"><MapPin className="h-4 w-4"/> Ver indicaciones en Google Maps</a>

          <p className="rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-3 text-xs leading-relaxed text-amber-100/90">Demostración: los datos, precios y asientos son ejemplos. Al continuar no se contactará al conductor ni se reservará un viaje real.</p>

          {/* Seat Selector (Ref 2 Style) */}
          <div className="p-3.5 rounded-2xl bg-[#0c0f17] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">¿Cuántos asientos reservas?</span>
              <span className="text-[11px] text-slate-400">Quedan {ride.availableSeats} disponibles</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3].slice(0, ride.availableSeats).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSelectedSeatCount(count)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    selectedSeatCount === count
                      ? 'bg-[#315cff] text-slate-950 shadow-md'
                      : 'bg-[#181d2a] text-slate-400 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer with Pricing & Sticky CTA */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0c0f17] flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Aporte ilustrativo</span>
            <span className="text-2xl font-display font-black text-white">
              ${totalPrice.toFixed(2)} USD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#131722] border border-white/10 transition-colors"
            >
              Cerrar
            </button>

            <button
              disabled={isBooking || ride.availableSeats < 1}
              onClick={handleConfirm}
              className="min-h-[46px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-[#315cff] to-[#00a89d] hover:from-[#4d77ff] hover:to-[#22c4b7] disabled:opacity-50 shadow-lg shadow-[#315cff]/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              {isBooking ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>Confirmando...</span>
                </>
              ) : ride.availableSeats < 1 ? (
                <span>Sin asientos de ejemplo</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simular solicitud</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
