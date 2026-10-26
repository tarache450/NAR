import React from 'react';
import { CheckCircle2, MapPinned, MessageCircleWarning, ShieldCheck } from 'lucide-react';

const points = [
  { title: 'Revisa los puntos', detail: 'Comprueba dónde empieza y termina el tramo antes de organizar el encuentro.', icon: MapPinned },
  { title: 'Habla directamente', detail: 'En esta maqueta no hay chat conectado. Confirma los detalles por un canal acordado por ambas partes.', icon: MessageCircleWarning },
  { title: 'Acuerda el aporte', detail: 'Los precios son ejemplos. El importe y cualquier pago se acuerdan fuera de NAR.', icon: CheckCircle2 },
];

export const TrustSafetySection: React.FC = () => (
  <section className="nar-reveal py-12 md:py-16" aria-labelledby="safety-title">
    <div className="mx-auto max-w-6xl px-4">
      <div className="max-w-3xl">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#9cb3ff]/25 bg-[#315cff]/10 px-3 py-1 text-xs font-semibold text-[#b8c6ff]"><ShieldCheck size={14}/> Antes de compartir un viaje</span>
        <h2 id="safety-title" className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">Información clara para decidir con calma.</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-slate-400">NAR se muestra aquí como prototipo. No valida identidades, vehículos ni reseñas; tampoco ofrece seguimiento GPS, asistencia de emergencia o pagos.</p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {points.map(({ title, detail, icon: Icon }, index) => <article key={title} className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#315cff]/10 text-[#aebdff]"><Icon size={19}/></span>
          <h3 className="mt-4 font-bold text-white">{`0${index + 1}`} · {title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{detail}</p>
        </article>)}
      </div>
      <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm leading-relaxed text-amber-100/90">
        <strong>Para un viaje real:</strong> verifica por tu cuenta con quién viajarás, acuerda un punto público y comparte tu plan con alguien de confianza. El botón de mapas abre indicaciones de Google Maps; no rastrea el vehículo.
      </div>
    </div>
  </section>
);
