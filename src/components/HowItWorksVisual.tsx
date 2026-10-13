import React from 'react';
import { 
  MapPin, 
  UserCheck, 
  Car, 
  Coins, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Route
} from 'lucide-react';

export const HowItWorksVisual: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Encuentra tu ruta',
      desc: 'Introduce tu origen y destino. Verás conductores que ya van a pasar por ahí a la hora que necesitas.',
      icon: Route,
      badge: 'Sin desvíos de taxi',
      color: 'from-amber-400 to-orange-500',
      tagColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    },
    {
      number: '02',
      title: 'Conecta con quien ya viaja',
      desc: 'Revisa el perfil, valoraciones de otros salvadoreños, modelo del vehículo y DUI verificado.',
      icon: UserCheck,
      badge: 'Identidad 100% verificada',
      color: 'from-cyan-400 to-blue-500',
      tagColor: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    },
    {
      number: '03',
      title: 'Comparte el trayecto y gastos',
      desc: 'Reserva tu asiento. Aportas una cuota justa de gasolina y viajas con aire acondicionado y comodidad.',
      icon: Coins,
      badge: 'Desde $3.00 USD',
      color: 'from-emerald-400 to-teal-500',
      tagColor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    },
  ];

  return (
    <section className="py-10 md:py-14 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400 block mb-2">
            SIMPLE, DIRECTO Y SEGURO
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            ¿Cómo funciona NAR?
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            No somos Uber ni taxis. Conectamos personas cuyos desplazamientos en El Salvador ya son compatibles.
          </p>
        </div>

        {/* 3 Visual Interactive Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div 
                key={idx}
                className="group relative bg-[#131722] hover:bg-[#181d2a] border border-white/10 hover:border-cyan-400/40 rounded-3xl p-6 sm:p-7 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Number & Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display font-black text-3xl sm:text-4xl text-white/20 group-hover:text-cyan-400/40 transition-colors">
                      {st.number}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${st.tagColor}`}>
                      {st.badge}
                    </span>
                  </div>

                  {/* Icon Circle */}
                  <div className="w-12 h-12 rounded-2xl bg-[#0c0f17] border border-white/10 flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>

                  {/* Title & Desc */}
                  <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-cyan-300 transition-colors">
                    {st.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="pt-4 mt-5 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-cyan-400/80 group-hover:text-cyan-300">
                  <span>Paso {idx + 1} de 3</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
