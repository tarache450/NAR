import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Button, cx } from './ui/primitives';
import { NAV_LABELS, type ViewType } from '../lib/nav';
import { Plus, LogIn, User as UserIcon } from 'lucide-react';
import GooeyNav from './bits/GooeyNav';
import { hashFor } from '../lib/nav';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenPublish: () => void;
  onOpenAuth: () => void;
  activeTripCount: number;
}

const CENTER: ViewType[] = ['explore', 'search', 'corridors', 'telemetry', 'profile'];

export const Navbar: React.FC<NavbarProps> = ({ 
  activeView, 
  onNavigate, 
  onOpenPublish, 
  onOpenAuth, 
  activeTripCount 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cx(
        'fixed top-0 inset-x-0 z-50 transition-colors duration-300',
        scrolled ? 'bg-bg/80 backdrop-blur-md border-b border-line' : 'bg-transparent border-b border-transparent'
      )}
    >
      <nav aria-label="Principal" className="container-nar h-[64px] md:h-[76px] flex items-center justify-between gap-4 sm:gap-6">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('explore');
          }}
          className="rounded-[10px] -m-1 p-1 shrink-0"
          aria-label="NAR, ir al inicio"
        >
          <Logo wordmark />
        </a>

        <div className="hidden lg:block">
          <GooeyNav
            items={CENTER.map((v) => ({
              label: v === 'telemetry' && activeTripCount > 0 ? `${NAV_LABELS[v]} · ${activeTripCount}` : NAV_LABELS[v],
              href: hashFor(v),
            }))}
            activeIndex={Math.max(0, CENTER.indexOf(activeView))}
            onChange={(i) => {
              const v = CENTER[i];
              if (v) onNavigate(v);
            }}
            theme="dark"
            size="md"
            colors={['#2d62ff', '#21d2ed', '#00c29a', '#ffffff']}
            activeTextColor="#09090b"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón de Publicar Viaje */}
          <span className="hidden sm:block">
            <Button variant="outline" size="md" onClick={onOpenPublish}>
              Publicar viaje
            </Button>
          </span>
          <span className="sm:hidden">
            <Button variant="outline" size="sm" onClick={onOpenPublish}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Publicar
            </Button>
          </span>

          {/* Autenticación Real de Supabase */}
          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 pl-2 border-l border-line cursor-pointer group"
              title={profile?.full_name || 'Mi Perfil'}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-line-strong group-hover:border-primary transition-colors bg-surface-2 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Perfil'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-muted" />
                )}
              </div>
              <span className="hidden xl:inline text-xs font-bold text-white group-hover:text-primary transition-colors max-w-[100px] truncate">
                {profile?.full_name?.split(' ')[0] || 'Mi cuenta'}
              </span>
            </button>
          ) : (
            <Button variant="primary" size="sm" onClick={onOpenAuth}>
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ingresar</span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};
