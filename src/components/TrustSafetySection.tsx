import React from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  PhoneCall, 
  Star, 
  MapPin, 
  Award, 
  HeartHandshake, 
  CheckCircle2,
  FileCheck,
  Building
} from 'lucide-react';

export const TrustSafetySection: React.FC = () => {
  const safetyFeatures = [
    {
      title: 'Validación con DUI Oficial',
      desc: 'Verificamos el Documento Único de Identidad de cada conductor y pasajero antes de su primer viaje.',
      icon: FileCheck,
      stat: '100% Auditado',
    },
    {
      title: 'Número Salvadoreño +503 Activo',
      desc: 'Comprobación vía SMS directo. Solo personas reales con número activo pueden comunicarse en cabina.',
      icon: PhoneCall,
      stat: 'Doble Factor SMS',
    },
    {
      title: 'Red Universitaria & Laboral',
      desc: 'Validación opcional con correo institucional (UCA, ESEN, UES, empresas) para viajar entre colegas conocidos.',
      icon: Building,
      stat: 'Comunidad Verificada',
    },
    {
      title: 'Calificaciones Mutuas Obligatorias',
      desc: 'Tanto el conductor como el pasajero se evalúan al finalizar. Mantenemos una comunidad con promedio 4.9★.',
      icon: Star,
      stat: 'Transparencia Total',
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CONFIANZA Y SEGURIDAD PRIMERO</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Viaja tranquilo. Conoce con quién vas en el camino.
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Diseñamos cada capa de la plataforma para que sepas exactamente la identidad y reputación de cada compañero de viaje.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#131722] border border-white/10 shrink-0">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">
              Protocolo de Seguridad <strong className="text-white">NAR Shield</strong>
            </span>
          </div>
        </div>

        {/* 4 Cards of Trust */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {safetyFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-[#131722] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#0c0f17] border border-white/10 flex items-center justify-center text-emerald-400 mb-4 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold">
                  <span>{feat.stat}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification Example Profile Card */}
        <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-[#131722] via-[#1a2030] to-[#131722] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" 
                alt="Conductor Verificado"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400" 
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#131722]">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">Miguel Ángel Cortez</span>
                <span className="text-xs font-bold text-yellow-400">★ 4.95</span>
              </div>
              <p className="text-xs text-slate-300">
                84 viajes completados · 0 cancelaciones · 1 año en NAR
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  DUI Verificado
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                  Teléfono +503 OK
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-md">
                  Toyota RAV4 2023
                </span>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-400 block font-mono">Tasa de recomendación</span>
            <span className="text-2xl font-display font-black text-emerald-400">99.2%</span>
            <span className="text-[10px] text-slate-500 block">Basado en reseñas reales</span>
          </div>
        </div>

      </div>
    </section>
  );
};
