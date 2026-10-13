import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRightLeft, 
  Car, 
  Navigation, 
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';

interface HeroSearchProps {
  origin: string;
  destination: string;
  onOriginChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSwapLocations: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  passengers: number;
  onPassengersChange: (num: number) => void;
  onSearch: () => void;
  onOpenPublish: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwapLocations,
  selectedDate,
  onDateChange,
  passengers,
  onPassengersChange,
  onSearch,
  onOpenPublish,
}) => {
  // Days of the week pills (Ref 2 style)
  const dateOptions = [
    { label: 'Hoy', day: 'Mié 16', val: 'hoy' },
    { label: 'Mañana', day: 'Jue 17', val: 'manana' },
    { label: 'Viernes', day: 'Vie 18', val: 'viernes' },
    { label: 'Sábado', day: 'Sáb 19', val: 'sabado' },
    { label: 'Domingo', day: 'Dom 20', val: 'domingo' },
  ];

  const popularCities = [
    'San Salvador', 
    'Santa Ana', 
    'Santa Tecla', 
    'La Libertad / El Tunco', 
    'San Miguel', 
    'Sonsonate'
  ];

  return (
    <section className="relative pt-6 pb-10 md:pt-10 md:pb-14">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-2">
        
        {/* Short, punchy headline with clear hierarchy */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#00c29a] animate-pulse" />
            <span className="font-bold text-white tracking-wide">NAR</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-300">Viajes Compartidos en El Salvador</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.12]">
            Encuentra quién ya va{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-white">
              por tu misma ruta
            </span>
          </h1>

          <p className="mt-3.5 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Sin tarifas de taxi ni desvíos. Conéctate con personas que ya van hacia tu destino o puntos intermedios y comparte el combustible.
          </p>

          {/* Quick Popular Destination Chips (BlaBlaCar Rapid Search Pattern) */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap mt-4">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Destinos rápidos:</span>
            {popularCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  onOriginChange('San Salvador');
                  onDestinationChange(city);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white transition-all font-medium"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Main Search Card + Live Graphic Route Corridor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column (8 cols): Modern Search Box (Ref 2 Vanta Ride Style) */}
          <div className="lg:col-span-7 bg-[#131722]/95 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/60 backdrop-blur-xl flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Origin & Destination with connector & swap button */}
              <div className="relative bg-[#0c0f17] border border-white/10 rounded-2xl p-3 sm:p-4">
                
                {/* Visual Route Connector Line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-amber-400 via-slate-600 to-cyan-400 z-0" />

                {/* From / Origin Input */}
                <div className="relative z-10 flex items-center gap-3.5 pb-3 border-b border-white/5">
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#0c0f17] shadow-sm shadow-amber-400/50 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400 block">
                      Punto de Origen
                    </span>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => onOriginChange(e.target.value)}
                      placeholder="Ej. San Salvador (Multiplaza / Metrocentro)"
                      className="w-full text-sm sm:text-base font-semibold text-white bg-transparent placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Destination Input */}
                <div className="relative z-10 flex items-center gap-3.5 pt-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-[#0c0f17] shadow-sm shadow-cyan-400/50 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-cyan-400 block">
                      Destino Final
                    </span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => onDestinationChange(e.target.value)}
                      placeholder="Ej. Santa Ana / El Tunco / San Miguel"
                      className="w-full text-sm sm:text-base font-semibold text-white bg-transparent placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Swap button placed on the right */}
                <button
                  type="button"
                  onClick={onSwapLocations}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-[#1c2232] border border-white/10 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-all z-20 shadow-md"
                  title="Invertir origen y destino"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Date Pills Slider (Ref 2 style) */}
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block mb-2">
                  ¿Cuándo viajas?
                </span>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {dateOptions.map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => onDateChange(opt.val)}
                      className={`p-2 sm:p-2.5 rounded-xl text-center transition-all ${
                        selectedDate === opt.val
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 border border-cyan-400'
                          : 'bg-[#0c0f17] text-slate-400 hover:text-white border border-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] block opacity-80 uppercase leading-none font-mono">
                        {opt.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold block mt-1 leading-none">
                        {opt.day}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Passengers Pill Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0c0f17] border border-white/10">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium">Asientos que necesitas:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onPassengersChange(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        passengers === num
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-[#181d2a] text-slate-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Primary Action Button */}
            <div className="pt-5 mt-5 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={onSearch}
                className="w-full sm:flex-1 min-h-[48px] py-3 px-6 rounded-2xl font-display font-extrabold text-sm sm:text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>Buscar Rutas Compatibles</span>
              </button>

              <button
                type="button"
                onClick={onOpenPublish}
                className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-[#0c0f17] hover:bg-[#1a2030] border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <span>¿Vas a manejar?</span>
                <span className="text-cyan-400 font-semibold">Ofrece tus asientos →</span>
              </button>
            </div>

          </div>

          {/* Right Column (5 cols): Visual Route Card & Interactive Telemetry Pin (Ref 1 & 3 Style) */}
          <div className="lg:col-span-5 bg-[#131722]/95 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Info */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase text-cyan-300">
                  Ruta Activa en Carretera
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                CA-1 Panamericana
              </span>
            </div>

            {/* Stylized Visual Dark Map with Route Vector (Ref 1 & Ref 3) */}
            <div className="relative z-10 my-2 rounded-2xl bg-[#090c13] border border-white/10 p-4 overflow-hidden min-h-[220px] flex flex-col justify-between">
              
              {/* Topographic grid overlay */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#22d3ee 1px, transparent 1px), radial-gradient(#3b82f6 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px'
                }}
              />

              {/* Glowing Route Polyline SVG */}
              <div className="relative my-4">
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 320 80" fill="none">
                  {/* Outer glow line */}
                  <path 
                    d="M 20 60 Q 90 20 160 50 T 300 25" 
                    stroke="#22d3ee" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeOpacity="0.2"
                  />
                  {/* Core sharp line */}
                  <path 
                    d="M 20 60 Q 90 20 160 50 T 300 25" 
                    stroke="url(#routeGrad)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeDasharray="4 2"
                  />
                  <defs>
                    <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  
                  {/* Origin Node Pin */}
                  <circle cx="20" cy="60" r="5" fill="#f59e0b" />
                  
                  {/* Intermediate Stop Pin (Santa Tecla) */}
                  <circle cx="160" cy="50" r="4" fill="#22d3ee" />
                  
                  {/* Destination Node Pin (Santa Ana) */}
                  <circle cx="300" cy="25" r="5" fill="#10b981" />
                </svg>

                {/* Floating Pickup Badge (Ref 1 Style: "Pickup in 7m") */}
                <div className="absolute top-1 left-1/3 transform -translate-x-1/2 bg-[#181e2b] border border-cyan-400/40 px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[11px] font-bold text-white">Parada Santa Tecla</span>
                  <span className="text-[10px] font-mono text-cyan-300">Pasa en 12m</span>
                </div>
              </div>

              {/* Waypoints summary in map */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <div>
                  <span className="text-slate-400 text-[10px] block">Salida</span>
                  <span className="font-bold text-white">San Salvador</span>
                </div>
                <div className="text-center">
                  <span className="text-cyan-400 text-[10px] font-mono block">62 km directos</span>
                  <span className="text-slate-300 text-[11px]">Carretera Los Chorros</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Llegada</span>
                  <span className="font-bold text-white">Santa Ana</span>
                </div>
              </div>

            </div>

            {/* Bottom Driver Snapshot */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" 
                  alt="Miguel" 
                  className="w-10 h-10 rounded-xl object-cover border border-white/20"
                />
                <div>
                  <span className="text-xs font-bold text-white block">Miguel A. Cortez</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-yellow-400 font-semibold">★ 4.95</span>
                    <span>·</span>
                    <span>Toyota RAV4</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-mono">Aporte gasolina</span>
                <span className="text-base font-extrabold text-cyan-300 font-display">$3.50</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
