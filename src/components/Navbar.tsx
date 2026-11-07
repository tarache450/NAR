import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { Button, cx } from './ui/primitives';
import { NAV_LABELS, type ViewType } from '../lib/nav';
import { Plus } from 'lucide-react';
import GooeyNav from './bits/GooeyNav';
import { hashFor } from '../lib/nav';

interface NavbarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenPublish: () => void;
  activeTripCount: number;
}

const CENTER: ViewType[] = ['explore', 'search', 'corridors', 'telemetry', 'profile'];

export const Navbar: React.FC<NavbarProps> = ({ activeView, onNavigate, onOpenPublish, activeTripCount }) => {
  const [scrolled, setScrolled] = useState(false);

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
      <nav aria-label="Principal" className="container-nar h-[64px] md:h-[76px] flex items-center justify-between gap-6">
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('explore');
          }}
          className="rounded-[10px] -m-1 p-1"
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

        <div className="flex items-center gap-2 sm:gap-4">
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
        </div>
      </nav>
    </header>
  );
};
