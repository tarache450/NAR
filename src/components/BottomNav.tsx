import React from 'react';
import { Home, Search, Map, Navigation, User } from 'lucide-react';
import { cx } from './ui/primitives';
import type { ViewType } from '../lib/nav';

interface BottomNavProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  hasActiveTrip: boolean;
}

const ITEMS: { view: ViewType; label: string; Icon: typeof Home }[] = [
  { view: 'explore', label: 'Inicio', Icon: Home },
  { view: 'search', label: 'Buscar', Icon: Search },
  { view: 'corridors', label: 'Corredores', Icon: Map },
  { view: 'telemetry', label: 'Mi viaje', Icon: Navigation },
  { view: 'profile', label: 'Perfil', Icon: User },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, hasActiveTrip }) => (
  <nav
    aria-label="Navegación móvil"
    className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg/90 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]"
  >
    <ul className="grid grid-cols-5 max-w-md mx-auto">
      {ITEMS.map(({ view, label, Icon }) => {
        const active = view === activeView;
        return (
          <li key={view}>
            <button
              type="button"
              onClick={() => onNavigate(view)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'relative w-full h-[60px] flex flex-col items-center justify-center gap-1 text-[11px] transition-colors',
                active ? 'text-fg' : 'text-subtle hover:text-fg'
              )}
            >
              <span className="relative">
                <Icon className={cx('w-5 h-5', active && 'text-accent')} strokeWidth={1.75} />
                {view === 'telemetry' && hasActiveTrip ? (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-accent" aria-label="Reserva activa" />
                ) : null}
              </span>
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
