import React from 'react';
import { Logo } from './Logo';
import type { ViewType } from '../lib/nav';
import type { Corridor } from '../lib/rides';
import { DEMO_NOTICE } from '../data/demoUser';

interface FooterProps {
  onNavigate: (view: ViewType, anchor?: string) => void;
  onOpenPublish: () => void;
  onSelectCorridor: (origin: string, destination: string) => void;
  corridors: Corridor[];
}

const linkCls = 'text-[16px] text-muted hover:text-fg transition-colors text-left';

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPublish, onSelectCorridor, corridors }) => (
  <footer className="relative z-[1] border-t border-line pt-16 pb-28 lg:pb-12">
    <div className="container-nar">
      <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-x-6 gap-y-12">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4 max-w-[320px]">
          <Logo wordmark size="lg" />
          <p className="t-body text-muted">
            Viajes compartidos en El Salvador: reserva un asiento en una ruta que un conductor ya va a hacer y comparte la
            gasolina.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="t-h6">Navegación</h2>
          <ul className="flex flex-col gap-3">
            <li>
              <button type="button" className={linkCls} onClick={() => onNavigate('search')}>
                Rutas y viajes
              </button>
            </li>
            <li>
              <button type="button" className={linkCls} onClick={() => onNavigate('corridors')}>
                Corredores en El Salvador
              </button>
            </li>
            <li>
              <button type="button" className={linkCls} onClick={onOpenPublish}>
                Registrarse como Conductor
              </button>
            </li>
            <li>
              <button type="button" className={linkCls} onClick={() => onNavigate('profile')}>
                Mi Perfil
              </button>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="t-h6">Corredores</h2>
          <ul className="flex flex-col gap-3">
            {corridors.slice(0, 5).map((c) => (
              <li key={c.key}>
                <button type="button" className={linkCls} onClick={() => onSelectCorridor(c.origin, c.destination)}>
                  {c.origin} → {c.destination}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="t-h6">Información</h2>
          <ul className="flex flex-col gap-3">
            <li>
              <button type="button" className={linkCls} onClick={() => onNavigate('explore', 'como-funciona')}>
                Cómo funciona
              </button>
            </li>
            <li>
              <button type="button" className={linkCls} onClick={() => onNavigate('explore', 'seguridad')}>
                Seguridad
              </button>
            </li>
            <li>
              <button type="button" className={linkCls} onClick={() => onNavigate('explore', 'faq')}>
                Preguntas frecuentes
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t border-line flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <p className="t-small text-muted">© {new Date().getFullYear()} NAR El Salvador · Precios en USD</p>
        <p className="t-small text-subtle max-w-[620px] md:text-right">{DEMO_NOTICE}</p>
      </div>
    </div>
  </footer>
);
