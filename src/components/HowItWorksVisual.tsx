import React, { lazy, Suspense } from 'react';

const MagicBento = lazy(() => import('./reactbits/MagicBento').then(m => ({ default: m.default as React.ComponentType<any> })));
const AnimatedContent = lazy(() => import('./reactbits/AnimatedContent').then(m => ({ default: m.default as React.ComponentType<any> })));

const steps = [
  { label: '01 · BUSCA', title: 'Encuentra una ruta', description: 'Indica desde dónde sales y adónde quieres llegar. Los resultados actuales son datos de ejemplo.', visual: <span className="nar-step-number">01</span> },
  { label: '02 · REVISA', title: 'Compara el trayecto', description: 'Consulta los puntos, horario, aporte y perfil ilustrativo antes de organizar tu viaje.', visual: <span className="nar-step-number">02</span> },
  { label: '03 · PLANEA', title: 'Organiza el encuentro', description: 'Abre las indicaciones de Google Maps y acuerda los detalles directamente. Esta maqueta no confirma viajes.', visual: <span className="nar-step-number">03</span> },
];

export function HowItWorksVisual() {
  return <section className="nar-steps py-14 md:py-20 px-4" aria-labelledby="nar-steps-title">
    <div className="max-w-6xl mx-auto">
      <Suspense fallback={<div className="nar-steps-intro"><span className="nar-kicker">TRES PASOS PARA PLANEAR</span><h2 id="nar-steps-title" className="text-3xl md:text-4xl font-display font-extrabold text-white mt-3 mb-3">Comparte el camino, con claridad.</h2><p className="text-slate-400 max-w-2xl mb-9">Un recorrido claro desde la búsqueda hasta las indicaciones.</p></div>}>
        <AnimatedContent className="nar-steps-intro" distance={24} duration={0.5} stagger={0.08} threshold={0.08}>
          <span className="nar-kicker">TRES PASOS PARA PLANEAR</span>
          <h2 id="nar-steps-title" className="text-3xl md:text-4xl font-display font-extrabold text-white mt-3 mb-3">Comparte el camino, con claridad.</h2>
          <p className="text-slate-400 max-w-2xl mb-9">Un recorrido claro desde la búsqueda hasta las indicaciones.</p>
        </AnimatedContent>
      </Suspense>
      <Suspense fallback={<div className="nar-steps-placeholder" aria-hidden="true" />}><MagicBento items={steps} columns={3} rowHeight={245} gap={16} radius={20} glowColor="#315cff" enableStars={false} enableTilt={false} enableMagnetism={false} clickEffect={false} /></Suspense>
    </div>
  </section>;
}
