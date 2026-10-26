import React from 'react';
import { ArrowRight, CarFront, CircleUserRound, Info, Route, ShieldCheck } from 'lucide-react';

interface ProfileViewProps {
  onOpenPublish: () => void;
  onExploreRides: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenPublish, onExploreRides }) => (
  <section className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:py-12" aria-labelledby="profile-title">
    <div className="rounded-3xl border border-white/10 bg-[linear-gradient(130deg,#17243a,#111827_65%)] p-6 sm:p-9">
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-[#b8c6ff]"><CircleUserRound size={27}/></span>
        <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#b8c6ff]">Perfil de demostración</p><h1 id="profile-title" className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Tu cuenta empieza aquí.</h1><p className="mt-3 max-w-2xl leading-relaxed text-slate-300">La creación de cuentas y la verificación de identidad aún no están conectadas. Los perfiles que ves al explorar son datos ilustrativos.</p></div>
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <button onClick={onExploreRides} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#315cff] px-5 font-bold text-white hover:bg-[#456dff]">Explorar rutas <ArrowRight size={17}/></button>
        <button onClick={onOpenPublish} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 font-semibold text-white hover:bg-white/10"><CarFront size={17}/> Probar formulario de publicación</button>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-[#111827] p-5"><Route className="text-[#aebdff]"/><h2 className="mt-4 font-bold text-white">Tus viajes</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">Las solicitudes y publicaciones solo viven en el estado temporal de esta página. No se guardan ni se comparten.</p></article>
      <article className="rounded-2xl border border-white/10 bg-[#111827] p-5"><ShieldCheck className="text-[#aebdff]"/><h2 className="mt-4 font-bold text-white">Confianza y seguridad</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">No mostramos insignias de verificación. La versión actual no solicita ni comprueba documentos personales.</p></article>
    </div>
    <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-[#0c1017] p-4 text-xs leading-relaxed text-slate-400"><Info size={16} className="mt-0.5 shrink-0 text-[#aebdff]"/>No introduzcas datos personales reales en esta demostración.</p>
  </section>
);
