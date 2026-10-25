import { useState } from 'react';
import { ArrowUpRight, Menu, Monitor, Plus, Smartphone, X } from 'lucide-react';
import { Logo } from './Logo';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import type { TabType } from './BottomNav';

interface NavbarProps {
  activeView: TabType;
  onViewChange: (view: TabType) => void;
  onOpenPublish: () => void;
  isMobileMockup: boolean;
  onToggleMockup: () => void;
}

const navigation: { view: TabType; label: string }[] = [
  { view: 'explore', label: 'Explorar' },
  { view: 'search', label: 'Buscar rutas' },
  { view: 'telemetry', label: 'Ruta demo' },
  { view: 'profile', label: 'Mi perfil' },
];

export function Navbar({
  activeView,
  onViewChange,
  onOpenPublish,
  isMobileMockup,
  onToggleMockup,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (view: TabType) => {
    onViewChange(view);
    setMenuOpen(false);
  };

  return (
    <header className="nar-header">
      <div className="nar-container nar-header-inner">
        <button
          type="button"
          className="nar-brand"
          onClick={() => navigate('explore')}
          title="Ir al inicio"
        >
          <Logo size="md" />
        </button>

        <nav className="nar-main-nav" aria-label="Navegación principal">
          {navigation.map((item) => (
            <button
              key={item.view}
              type="button"
              className={`nar-nav-link${activeView === item.view ? ' is-active' : ''}`}
              aria-current={activeView === item.view ? 'page' : undefined}
              onClick={() => navigate(item.view)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nar-header-actions">
          <button
            type="button"
            className="nar-preview-toggle"
            onClick={onToggleMockup}
            title={isMobileMockup ? 'Salir de la vista móvil' : 'Previsualizar vista móvil'}
          >
            {isMobileMockup ? <Monitor size={17} /> : <Smartphone size={17} />}
            <span>{isMobileMockup ? 'Vista completa' : 'Vista móvil'}</span>
          </button>
          <button type="button" className="nar-publish-button" onClick={onOpenPublish} aria-label="Publicar una ruta">
            <Plus size={17} aria-hidden="true" />
            <span>Publicar ruta</span>
            <ArrowUpRight size={15} className="nar-publish-arrow" aria-hidden="true" />
          </button>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button type="button" className="nar-menu-toggle" aria-label="Abrir menú">
                <Menu size={22} aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="nar-sheet-content" showCloseButton={false}>
              <SheetHeader className="nar-sheet-header">
                <div><SheetTitle>Menú NAR</SheetTitle><SheetDescription>Explora tu próximo camino.</SheetDescription></div>
                <SheetClose className="nar-sheet-close" aria-label="Cerrar menú"><X size={21} aria-hidden="true" /></SheetClose>
              </SheetHeader>
              <nav className="nar-mobile-menu" aria-label="Menú móvil">
                {navigation.map((item) => (
                  <button
                    key={item.view}
                    type="button"
                    className={activeView === item.view ? 'nar-mobile-link is-active' : 'nar-mobile-link'}
                    aria-current={activeView === item.view ? 'page' : undefined}
                    onClick={() => navigate(item.view)}
                  >
                    {item.label}<ArrowUpRight size={17} aria-hidden="true" />
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </header>
  );
}
