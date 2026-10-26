import React, { useState } from 'react';
import { Check, Copy, Info, X } from 'lucide-react';
import type { Ride } from '../types';

interface DigitalBoardingPassModalProps { ride: Ride; seatNumber?: number; onClose: () => void; }

export const DigitalBoardingPassModal: React.FC<DigitalBoardingPassModalProps> = ({ ride, seatNumber = 1, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const reference = `NAR-DEMO-${ride.id.slice(-4).toUpperCase()}-${seatNumber}`;

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="demo-receipt-title" className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#131722] shadow-2xl">
      <button onClick={onClose} aria-label="Cerrar resumen" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/5 text-slate-300 hover:bg-white/10"><X size={18}/></button>
      <header className="border-b border-white/10 bg-[#0c0f17] p-6 pr-16">
        <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#aebdff]">Vista de prueba</p>
        <h2 id="demo-receipt-title" className="mt-2 text-2xl font-extrabold text-white">Resumen de solicitud</h2>
        <p className="mt-2 text-sm text-slate-400">No es un pase de abordar ni confirma un asiento.</p>
      </header>
      <div className="space-y-5 p-6">
        <div className="rounded-2xl border border-white/10 bg-[#0c0f17] p-4">
          <p className="text-xs text-slate-400">Código ilustrativo</p>
          <div className="mt-2 flex items-center justify-between gap-3"><code className="font-mono text-sm font-bold tracking-wider text-white">{reference}</code><button onClick={copyReference} aria-label="Copiar código ilustrativo" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-slate-300 hover:bg-white/10">{copied ? <Check size={16}/> : <Copy size={16}/>}</button></div>
          {copied && <p role="status" className="mt-2 text-xs text-[#b8c6ff]">Código copiado.</p>}
          {copyError && <p role="status" className="mt-2 text-xs text-amber-200">El navegador bloqueó el portapapeles; puedes seleccionar y copiar el código.</p>}
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-400">Trayecto</dt><dd className="mt-1 font-medium text-white">{ride.origin.city} → {ride.destination.city}</dd></div><div><dt className="text-slate-400">Asientos solicitados</dt><dd className="mt-1 font-medium text-white">{seatNumber}</dd></div></dl>
        <p className="flex gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-3 text-xs leading-relaxed text-amber-100/90"><Info size={16} className="mt-0.5 shrink-0"/>La solicitud solo se simuló en esta página. No se guardó, cobró, envió al conductor ni generó un QR válido.</p>
      </div>
      <footer className="border-t border-white/10 bg-[#0c0f17] p-4"><button onClick={onClose} className="min-h-11 w-full rounded-xl bg-white/10 font-semibold text-white hover:bg-white/15">Entendido</button></footer>
    </section>
  </div>;
};
