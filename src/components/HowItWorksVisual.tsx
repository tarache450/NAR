import React, { lazy, Suspense } from 'react';

const MagicBento = lazy(() => import('./reactbits/MagicBento').then(m => ({ default: m.default as React.ComponentType<any> })));
const AnimatedContent = lazy(() => import('./reactbits/AnimatedContent').then(m => ({ default: m.default as React.ComponentType<any> })));

const steps = [
  { label: '01 · BUSCA', title: 'Encuentra tu ruta', description: 'Indica desde dónde sales y adónde vas. Compara viajes que ya pasan por tu camino.', visual: <span className="nar-step-number">01</span> },
  { label: '02 · CONECTA', title: 'Conoce a tu conductor', description: 'Consulta el trayecto, los asientos, el vehículo y el perfil antes de decidir.', visual: <span className="nar-step-number">02</span> },
  { label: '03 · COMPARTE', title: 'Viajen juntos', description: 'Reserva tu lugar y comparte los gastos del recorrido con tu comunidad.', visual: <span className="nar-step-number">03</span> },
];

export function HowItWorksVisual() {
  return <section className="nar-steps py-14 md:py-20 px-4" aria-labelledby="nar-steps-title">
    <div className="max-w-6xl mx-auto">
      <Suspense fallback={<div className="nar-steps-intro"><span className="nar-kicker">SIMPLE, DIRECTO Y SEGURO</span><h2 id="nar-steps-title" className="text-3xl md:text-4xl font-display font-extrabold text-white mt-3 mb-3">Compartir camino es así de fácil.</h2><p className="text-slate-400 max-w-2xl mb-9">Tres pasos para encontrar compañía en un trayecto que ya existe.</p></div>}>
        <AnimatedContent className="nar-steps-intro" distance={24} duration={0.5} stagger={0.08} threshold={0.08}>
          <span className="nar-kicker">SIMPLE, DIRECTO Y SEGURO</span>
          <h2 id="nar-steps-title" className="text-3xl md:text-4xl font-display font-extrabold text-white mt-3 mb-3">Compartir camino es así de fácil.</h2>
          <p className="text-slate-400 max-w-2xl mb-9">Tres pasos para encontrar compañía en un trayecto que ya existe.</p>
        </AnimatedContent>
      </Suspense>
      <Suspense fallback={<div className="nar-steps-placeholder" aria-hidden="true" />}><MagicBento items={steps} columns={3} rowHeight={245} gap={16} radius={20} glowColor="#315cff" enableStars={false} enableTilt={false} enableMagnetism={false} clickEffect={false} /></Suspense>
    </div>
  </section>;
}
