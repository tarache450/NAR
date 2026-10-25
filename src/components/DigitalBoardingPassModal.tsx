import React, { useState } from 'react';
import { Ride } from '../types';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  Check, 
  MapPin, 
  Clock, 
  Car
} from 'lucide-react';

interface DigitalBoardingPassModalProps {
  ride: Ride;
  seatNumber?: number;
  onClose: () => void;
}

export const DigitalBoardingPassModal: React.FC<DigitalBoardingPassModalProps> = ({
  ride,
  seatNumber = 1,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const passCode = `NAR-${ride.id.slice(-4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#131722] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#0c0f17] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pass Top Branding */}
        <div className="p-5 bg-[#0c0f17] border-b border-white/10 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PASE DE EJEMPLO · NO VERIFICABLE</span>
          </div>
          <h3 className="font-display font-extrabold text-lg text-white">
            NAR <span className="text-[#00c29a]">Digital Pass</span>
          </h3>
          <p className="text-xs text-slate-400">
            Este gráfico ilustra el pase; todavía no es un QR escaneable.
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-6 flex flex-col items-center bg-[#090c13]">
          <div className="relative p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            {/* Visual Geometric SVG QR */}
            <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="26" height="26" rx="4" fill="#0c0f17" />
              <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
              <rect x="13" y="13" width="10" height="10" rx="1" fill="#0c0f17" />

              <rect x="69" y="5" width="26" height="26" rx="4" fill="#0c0f17" />
              <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
              <rect x="77" y="13" width="10" height="10" rx="1" fill="#0c0f17" />

              <rect x="5" y="69" width="26" height="26" rx="4" fill="#0c0f17" />
              <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
              <rect x="13" y="77" width="10" height="10" rx="1" fill="#0c0f17" />

              <rect x="36" y="8" width="6" height="6" fill="#0c0f17" />
              <rect x="46" y="8" width="6" height="6" fill="#0c0f17" />
              <rect x="56" y="8" width="6" height="6" fill="#0c0f17" />
              <rect x="36" y="18" width="6" height="6" fill="#0c0f17" />
              <rect x="46" y="24" width="6" height="6" fill="#0c0f17" />

              {/* Center Kinetic Mark */}
              <rect x="35" y="35" width="30" height="30" rx="6" fill="#0c0f17" />
              <circle cx="50" cy="50" r="8" fill="#22d3ee" />
              <circle cx="50" cy="50" r="3" fill="#0c0f17" />

              <rect x="70" y="38" width="6" height="6" fill="#0c0f17" />
              <rect x="82" y="46" width="6" height="6" fill="#0c0f17" />
              <rect x="70" y="54" width="6" height="6" fill="#0c0f17" />
              <rect x="38" y="70" width="6" height="6" fill="#0c0f17" />
              <rect x="48" y="76" width="6" height="6" fill="#0c0f17" />
              <rect x="58" y="70" width="6" height="6" fill="#0c0f17" />
              <rect x="74" y="74" width="6" height="6" fill="#0c0f17" />
              <rect x="84" y="84" width="6" height="6" fill="#0c0f17" />
            </svg>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <span className="font-mono text-xs text-cyan-300 tracking-wider font-bold">
              {passCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white"
              title="Copiar código"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Boarding Details */}
        <div className="p-5 space-y-3 bg-[#131722] border-t border-white/10 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Asiento Reservado</span>
            <span className="font-extrabold text-white">Plaza #{seatNumber}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Conductor</span>
            <span className="font-bold text-white">{ride.driver.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Vehículo & Placa SV</span>
            <span className="font-mono text-cyan-300">{ride.vehicle.model} · {ride.vehicle.plate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Punto de Recogida</span>
            <span className="text-right text-slate-200 max-w-[190px] truncate">{ride.origin.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Hora de Salida</span>
            <span className="font-mono font-bold text-white">{ride.departureTime}</span>
          </div>
        </div>

        {/* Bottom footer button */}
        <div className="p-4 bg-[#0c0f17] border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            Cerrar Pase
          </button>
        </div>

      </div>
    </div>
  );
};
