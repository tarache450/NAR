import { ArrowUpRight, MessageCircle, Route, ShieldCheck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const principles = [
  {
    title: 'Conoce el trayecto',
    description: 'Consulta los puntos de salida, llegada y parada antes de elegir un viaje.',
    Icon: Route,
  },
  {
    title: 'Habla antes de salir',
    description: 'La demo muestra cómo sería la conversación entre pasajero y conductor.',
    Icon: MessageCircle,
  },
  {
    title: 'Decide con información',
    description: 'Compara plazas, aporte y detalles publicados en cada ruta de ejemplo.',
    Icon: ShieldCheck,
  },
];

export function TrustSafetySection() {
  return (
    <section className="nar-section nar-trust" aria-labelledby="nar-trust-title">
      <div className="nar-container nar-trust-layout">
        <div className="nar-trust-intro">
          <p className="nar-eyebrow">CONFIANZA EN CADA PASO</p>
          <h2 id="nar-trust-title">Más claridad antes de compartir el trayecto.</h2>
          <p>NAR presenta la información de cada viaje para ayudarte a decidir. Los perfiles, rutas y conversaciones actuales son datos de demostración.</p>
          <span className="nar-demo-note">Identidad y pagos aún no están conectados a servicios reales.</span>
        </div>
        <div className="nar-trust-list">
          {principles.map(({ title, description, Icon }, index) => (
            <article className="nar-trust-item" key={title}>
              <span className="nar-trust-index">0{index + 1}</span>
              <Icon size={22} aria-hidden="true" />
              <div><h3>{title}</h3><p>{description}</p></div>
              <ArrowUpRight size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
      <div className="nar-container nar-faq">
        <div><p className="nar-eyebrow">PREGUNTAS FRECUENTES</p><h2>Antes de empezar.</h2></div>
        <Accordion type="single" collapsible className="nar-faq-list">
          <AccordionItem value="rutas"><AccordionTrigger>¿Los viajes publicados son reales?</AccordionTrigger><AccordionContent>Por ahora, las rutas y los perfiles son ejemplos para explorar cómo funcionaría la experiencia.</AccordionContent></AccordionItem>
          <AccordionItem value="pagos"><AccordionTrigger>¿NAR verifica documentos o procesa pagos?</AccordionTrigger><AccordionContent>No en esta versión de demostración. Esas integraciones todavía no están conectadas.</AccordionContent></AccordionItem>
          <AccordionItem value="reservas"><AccordionTrigger>¿Se guardan mis reservas?</AccordionTrigger><AccordionContent>Los cambios se muestran durante la sesión actual del navegador y se restablecen al recargar la página.</AccordionContent></AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
