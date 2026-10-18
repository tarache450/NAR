import React, { useRef } from 'react';

interface AvatarGroupHoverProps {
  children: React.ReactNode;
  className?: string;
}

export function AvatarGroupHover({ children, className = '' }: AvatarGroupHoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const setShifts = (activeIndex: number | null, phase: 'in' | 'out') => {
    if (!rootRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const styles = getComputedStyle(document.documentElement);
    const number = (name: string, fallback: number) => {
      const value = Number.parseFloat(styles.getPropertyValue(name));
      return Number.isFinite(value) ? value : fallback;
    };
    const lift = number('--avatar-lift', -4);
    const falloff = number('--avatar-falloff', 0.45);
    const scale = number('--avatar-scale', 1.05);
    const easing = styles.getPropertyValue(phase === 'out' ? '--avatar-ease-out' : '--avatar-ease-in').trim();

    rootRef.current.querySelectorAll<HTMLElement>('.t-avatar').forEach((element, index) => {
      element.style.transitionTimingFunction = easing;
      element.style.setProperty('--shift', activeIndex === null ? '0px' : `${(lift * falloff ** Math.abs(index - activeIndex)).toFixed(3)}px`);
      element.style.setProperty('--scale-active', activeIndex === index ? String(scale) : '1');
    });
  };

  return <div ref={rootRef} className={`t-avatar-group ${className}`} onMouseLeave={() => setShifts(null, 'out')}>
    {React.Children.map(children, (child, index) => <div className="t-avatar" onMouseEnter={() => setShifts(index, 'in')}>{child}</div>)}
  </div>;
}
