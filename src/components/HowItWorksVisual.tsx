import { ArrowUpRight, Coins, Route, Users } from 'lucide-react';

const steps = [
  { title: 'Encuentra una ruta', description: 'Indica tu origen y destino para explorar los trayectos publicados en la demo.', Icon: Route },
  { title: 'Elige con quién viajar', description: 'Revisa el recorrido, los asientos disponibles y los detalles del conductor de ejemplo.', Icon: Users },
  { title: 'Comparte el camino', description: 'Solicita un asiento y consulta el aporte indicado para los gastos del trayecto.', Icon: Coins },
];

export function HowItWorksVisual() {
  return (
    <section className="nar-section nar-steps" aria-labelledby="nar-steps-title">
      <div className="nar-container">
        <div className="nar-section-heading">
          <p className="nar-eyebrow">ASÍ FUNCIONA</p>
          <h2 id="nar-steps-title">Tres pasos. Un camino compartido.</h2>
          <p>Una forma simple de explorar la idea de NAR con rutas de demostración.</p>
        </div>
        <div className="nar-step-grid nar-bento-wrap">
          {steps.map(({ title, description, Icon }, index) => (
            <article className="nar-step" key={title}>
              <div className="nar-step-top"><span>0{index + 1} / 03</span><Icon size={26} aria-hidden="true" /></div>
              <div><h3>{title}</h3><p>{description}</p></div>
              <ArrowUpRight className="nar-step-arrow" size={20} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
