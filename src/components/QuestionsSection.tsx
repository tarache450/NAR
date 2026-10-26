import React from 'react';

const questions = [
  ['¿Los viajes que aparecen están disponibles de verdad?', 'No. Esta versión usa rutas, perfiles, reseñas y precios de ejemplo para mostrar el flujo visual. No hay conductores conectados.'],
  ['¿Puedo reservar y pagar desde NAR?', 'No. La acción de solicitud solo cambia el estado en esta demostración local; no avisa a una persona ni procesa pagos.'],
  ['¿NAR verifica la identidad o el vehículo?', 'No en esta versión. Las etiquetas y estadísticas del prototipo no representan verificaciones reales y se han retirado de la interfaz.'],
  ['¿Cómo funciona Google Maps?', 'El enlace abre una búsqueda de indicaciones con origen, destino y paradas de ejemplo. Google puede sugerir otro recorrido y no recibe la ubicación del conductor desde NAR.'],
  ['¿Hay seguimiento en vivo, chat o botón de emergencia?', 'Todavía no. NAR no recibe GPS, no conecta a pasajeros con conductores y no puede contactar emergencias.'],
];

export const QuestionsSection: React.FC = () => (
  <section id="preguntas-frecuentes" className="nar-reveal mx-auto max-w-6xl px-4 py-12 md:py-16" aria-labelledby="questions-title">
    <div className="max-w-3xl">
      <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#aebdff]">Preguntas frecuentes</span>
      <h2 id="questions-title" className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">Lo que conviene saber antes de empezar.</h2>
    </div>
    <div className="mt-7 divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#111827] px-5 sm:px-7">
      {questions.map(([question, answer]) => <details key={question} className="group py-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white marker:hidden">{question}<span aria-hidden="true" className="text-xl text-[#aebdff] transition-transform group-open:rotate-45">+</span></summary>
        <p className="max-w-3xl pt-3 text-sm leading-relaxed text-slate-400">{answer}</p>
      </details>)}
    </div>
    <p className="mt-4 text-xs text-slate-500">Las funciones y límites descritos corresponden a esta demostración local.</p>
  </section>
);
