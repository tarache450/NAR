import React, { useEffect, useRef } from 'react';
import type { ViewType } from '../lib/nav';

/**
 * Fondo continuo de toda la web: tres luces con los colores del logo
 * (azul, turquesa, verde), una retícula de puntos tenue, grano fino y viñeta.
 * Es CSS puro sobre una capa fija, así que cuesta casi nada de rendimiento.
 * Las luces se desplazan un poco con el scroll (parallax) y cambian de
 * posición según la vista para que cada página tenga su propio carácter.
 */

type Point = [string, string];
const LAYOUTS: Record<ViewType, [Point, Point, Point]> = {
  explore: [['8%', '4%'], ['88%', '34%'], ['28%', '82%']],
  search: [['86%', '2%'], ['6%', '48%'], ['72%', '88%']],
  corridors: [['18%', '6%'], ['84%', '56%'], ['12%', '92%']],
  telemetry: [['78%', '8%'], ['12%', '38%'], ['86%', '84%']],
  profile: [['50%', '0%'], ['92%', '62%'], ['6%', '74%']],
};

export const AmbientBackground: React.FC<{ view?: ViewType }> = ({ view = 'explore' }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        el.style.setProperty('--amb-p', (window.scrollY / max).toFixed(4));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const [a, b, c] = LAYOUTS[view] || LAYOUTS.explore;

  return (
    <div ref={ref} aria-hidden="true" className="ambient">
      <div className="ambient-glow ambient-glow--a" style={{ left: a[0], top: a[1] }} />
      <div className="ambient-glow ambient-glow--b" style={{ left: b[0], top: b[1] }} />
      <div className="ambient-glow ambient-glow--c" style={{ left: c[0], top: c[1] }} />
      <div className="ambient-dots" />
      <div className="ambient-grain" />
      <div className="ambient-vignette" />
    </div>
  );
};
