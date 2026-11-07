import React, {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, X, ChevronDown, AlertCircle } from 'lucide-react';

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

/* ── Button ─────────────────────────────────────────────────────────────── */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BTN_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] font-medium transition-colors duration-200 select-none disabled:cursor-not-allowed disabled:opacity-45';
const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-white text-ink hover:bg-[#e6e6e8] active:bg-[#d4d4d8]',
  outline:
    'bg-transparent text-fg border border-line-strong hover:bg-white/[0.06] hover:border-white/20',
  ghost: 'bg-transparent text-muted hover:text-fg hover:bg-white/[0.05]',
  danger: 'bg-danger text-ink hover:bg-[#ff8585]',
};
const BTN_SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[14px]',
  md: 'h-11 px-4 text-[15px]',
  lg: 'h-[52px] px-6 text-[16px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', block, loading, className, children, disabled, type = 'button', ...rest },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], block && 'w-full', className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="w-4 h-4 rounded-full border-2 border-current border-r-transparent animate-spin"
        />
      ) : null}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

/* ── Eyebrow & encabezados de sección ───────────────────────────────────── */

export const Eyebrow: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <p className={cx('t-tag text-accent inline-flex items-center gap-2', className)}>
    <span aria-hidden="true" className="w-4 h-[3px] rounded-full bg-brand" />
    {children}
  </p>
);

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  muted?: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  id?: string;
  actions?: ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  muted,
  description,
  align = 'left',
  as = 'h2',
  id,
  actions,
  className,
}) => {
  const H = as;
  const centered = align === 'center';
  return (
    <div
      className={cx(
        'flex flex-col gap-6',
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className={cx('flex flex-col gap-3', centered ? 'items-center max-w-[720px]' : 'max-w-[640px]')}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <H id={id} className={as === 'h1' ? 't-h1' : 't-h2'}>
          {title}
          {muted ? (
            <>
              <br />
              <span className="text-muted">{muted}</span>
            </>
          ) : null}
        </H>
        {description ? <p className="t-body text-muted mt-1 max-w-[560px]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div> : null}
    </div>
  );
};

/* ── Badge ──────────────────────────────────────────────────────────────── */

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: 'bg-white/[0.06] text-muted border-line',
  accent: 'bg-accent-soft text-accent border-accent/25',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  danger: 'bg-danger-soft text-danger border-danger/25',
};

export const Badge: React.FC<{ tone?: BadgeTone; children: ReactNode; className?: string; icon?: ReactNode }> = ({
  tone = 'neutral',
  children,
  className,
  icon,
}) => (
  <span
    className={cx(
      'inline-flex items-center gap-1.5 h-6 px-2 rounded-[8px] border text-[12px] font-medium whitespace-nowrap',
      BADGE_TONE[tone],
      className
    )}
  >
    {icon}
    {children}
  </span>
);

/* ── Campos de formulario ───────────────────────────────────────────────── */

export const inputClass = (invalid?: boolean) =>
  cx(
    'w-full h-12 px-4 rounded-[12px] bg-surface-2 border text-[15px] text-fg placeholder:text-subtle transition-colors',
    'focus:outline-none focus:border-accent focus-visible:outline-none',
    invalid ? 'border-danger/70' : 'border-line-strong hover:border-white/20'
  );

interface FieldProps {
  label: string;
  hint?: string;
  error?: string | null;
  children: (props: {
    id: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }) => ReactNode;
  className?: string;
  optional?: boolean;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, children, className, optional }) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-[14px] text-fg flex items-center justify-between">
        <span>{label}</span>
        {optional ? <span className="text-[12px] text-subtle">Opcional</span> : null}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={errId} className="text-[13px] text-danger flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 mt-[2px] shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[13px] text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

/* ── Selector numérico ──────────────────────────────────────────────────── */

export const Stepper: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
  unit?: (n: number) => string;
}> = ({ value, min, max, onChange, label, unit }) => (
  <div className="inline-flex items-center gap-1 rounded-[12px] border border-line-strong bg-surface-2 p-1" role="group" aria-label={label}>
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label={`Quitar uno (${label})`}
      className="w-10 h-10 rounded-[9px] flex items-center justify-center text-fg hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Minus className="w-4 h-4" />
    </button>
    <output aria-live="polite" className="min-w-[72px] text-center text-[15px] tabular">
      {unit ? unit(value) : value}
    </output>
    <button
      type="button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label={`Añadir uno (${label})`}
      className="w-10 h-10 rounded-[9px] flex items-center justify-center text-fg hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>
);

/* ── Control segmentado (radio) ─────────────────────────────────────────── */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('inline-flex items-center gap-1 rounded-[12px] border border-line bg-surface p-1 max-w-full overflow-x-auto no-scrollbar', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'h-9 px-3.5 rounded-[9px] text-[14px] whitespace-nowrap transition-colors',
              active ? 'bg-white text-ink' : 'text-muted hover:text-fg'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Acordeón ───────────────────────────────────────────────────────────── */

export const AccordionItem: React.FC<{ question: string; children: ReactNode; defaultOpen?: boolean }> = ({
  question,
  children,
  defaultOpen,
}) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const id = useId();
  return (
    <div className="card">
      <h3 className="t-h6">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-4 text-left px-5 py-5 rounded-[16px]"
        >
          <span className="text-[16px] sm:text-[17px] leading-snug">{question}</span>
          <Plus
            aria-hidden="true"
            className={cx('w-5 h-5 shrink-0 text-muted transition-transform duration-300', open && 'rotate-45')}
          />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={cx('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 t-body text-muted">{children}</p>
        </div>
      </div>
    </div>
  );
};

/* ── Modal / hoja inferior ──────────────────────────────────────────────── */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, eyebrow, children, footer, size = 'md' }) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const t = window.setTimeout(() => {
      const first = focusables()[0];
      (first ?? panelRef.current)?.focus();
    }, 20);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-black/70 backdrop-blur-sm anim-fade"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'anim-rise relative w-full bg-surface border border-line-strong flex flex-col max-h-[92dvh]',
          'rounded-t-[20px] sm:rounded-[16px] focus:outline-none',
          size === 'lg' ? 'sm:max-w-[760px]' : 'sm:max-w-[560px]'
        )}
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
        <header className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-4 sm:pt-6 pb-4">
          <div className="min-w-0 flex flex-col gap-2">
            {eyebrow ? <div className="t-tag text-accent">{eyebrow}</div> : null}
            <h2 id={titleId} className="t-h5 sm:text-[24px] sm:leading-[1.25]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-10 h-10 shrink-0 rounded-[12px] border border-line-strong flex items-center justify-center text-muted hover:text-fg hover:bg-white/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="px-5 sm:px-6 pb-6 overflow-y-auto flex-1">{children}</div>
        {footer ? (
          <footer className="px-5 sm:px-6 py-4 border-t border-line bg-surface rounded-b-[16px] pb-[max(16px,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
};

/* ── Campo de barras (decoración tipo shader de Verity) ─────────────────── */

const BRAND_STOPS: [number, number, number][] = [
  [45, 98, 255],
  [33, 210, 237],
  [0, 194, 154],
];
/** Color de marca interpolado a lo largo del eje horizontal (0 → azul, 0.5 → turquesa, 1 → verde). */
const brandAt = (u: number): [number, number, number] => {
  const t = Math.min(1, Math.max(0, u)) * (BRAND_STOPS.length - 1);
  const i = Math.min(BRAND_STOPS.length - 2, Math.floor(t));
  const f = t - i;
  const a = BRAND_STOPS[i];
  const b = BRAND_STOPS[i + 1];
  return [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f)) as [number, number, number];
};

export const ShaderBars: React.FC<{
  className?: string;
  /** 0 → barras más altas a la izquierda, 1 → a la derecha */
  bias?: number;
  density?: number;
  intensity?: number;
}> = ({ className, bias = 0.75, density = 6, intensity = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const step = density;
      const barW = Math.max(1.5, step * 0.42);
      const time = t / 1000;
      for (let x = 0; x < w; x += step) {
        const u = x / w;
        const slope = 0.25 + 0.75 * Math.pow(bias >= 0.5 ? u : 1 - u, 1.6);
        const wave =
          0.55 +
          0.25 * Math.sin(u * 9 + time * 0.6) +
          0.12 * Math.sin(u * 23 - time * 0.9) +
          0.08 * Math.sin(u * 51 + time * 1.3);
        const amp = Math.min(1, Math.max(0.05, slope * wave * intensity));
        const barH = amp * h;
        const [r, gr, b] = brandAt(u);
        const g = ctx.createLinearGradient(0, h - barH, 0, h);
        g.addColorStop(0, `rgba(${r},${gr},${b},0)`);
        g.addColorStop(0.55, `rgba(${r},${gr},${b},${0.18 + amp * 0.25})`);
        g.addColorStop(1, `rgba(${r},${gr},${b},${0.55 + amp * 0.4})`);
        ctx.fillStyle = g;
        ctx.fillRect(x, h - barH, barW, barH);
      }
    };

    const loop = (t: number) => {
      if (visible) draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    if (reduce) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [bias, density, intensity]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cx('block w-full h-full pointer-events-none', className)} />;
};

/* ── Aparición al hacer scroll ──────────────────────────────────────────── */

export const Reveal: React.FC<{ children: ReactNode; className?: string; delay?: number; as?: 'div' | 'li' }> = ({
  children,
  className,
  delay = 0,
  as = 'div',
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cx('reveal', shown && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};

/* ── Avatar con respaldo de iniciales ───────────────────────────────────── */

export const Avatar: React.FC<{ src?: string; name: string; size?: number; className?: string }> = ({
  src,
  name,
  size = 40,
  className,
}) => {
  const [failed, setFailed] = useState(false);
  const initials = name
    .replace(/^(Dr\.|Dra\.)\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const style = { width: size, height: size };
  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        style={style}
        className={cx('rounded-full bg-surface-3 border border-line-strong flex items-center justify-center text-muted shrink-0', className)}
      >
        <span style={{ fontSize: Math.round(size * 0.36) }}>{initials}</span>
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={style}
      className={cx('rounded-full object-cover bg-surface-2 shrink-0', className)}
    />
  );
};

/* ── Decoración opcional: si falla o el equipo es modesto, no se muestra ── */

class DecorBoundary extends React.Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}

/** true si el dispositivo puede con efectos WebGL a pantalla completa sin sacrificar fluidez */
export function useRichEffects(minWidth = 768): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const evaluate = () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cores = navigator.hardwareConcurrency ?? 8;
      const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
      setOk(!reduce && !saveData && cores > 4 && window.innerWidth >= minWidth);
    };
    evaluate();
    window.addEventListener('resize', evaluate);
    return () => window.removeEventListener('resize', evaluate);
  }, [minWidth]);
  return ok;
}

export const Decor: React.FC<{ children: ReactNode; when?: boolean; fallback?: ReactNode }> = ({
  children,
  when = true,
  fallback = null,
}) =>
  when ? (
    <DecorBoundary fallback={fallback}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </DecorBoundary>
  ) : (
    <>{fallback}</>
  );

/* ── Estado vacío ───────────────────────────────────────────────────────── */

export const EmptyState: React.FC<{ icon?: ReactNode; title: string; description?: string; actions?: ReactNode }> = ({
  icon,
  title,
  description,
  actions,
}) => (
  <div className="card px-6 py-12 flex flex-col items-center text-center gap-4">
    {icon ? (
      <div className="w-12 h-12 rounded-[12px] surface-inset flex items-center justify-center text-accent">{icon}</div>
    ) : null}
    <div className="flex flex-col gap-2 max-w-[440px]">
      <h3 className="t-h5">{title}</h3>
      {description ? <p className="t-body text-muted">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap justify-center gap-3 mt-2">{actions}</div> : null}
  </div>
);

/* ── Disclosure sencillo ────────────────────────────────────────────────── */

export const Disclosure: React.FC<{ summary: ReactNode; children: ReactNode; className?: string }> = ({
  summary,
  children,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 px-4 rounded-[12px] border border-line-strong flex items-center justify-between text-[15px]"
      >
        {summary}
        <ChevronDown className={cx('w-4 h-4 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      <div id={id} hidden={!open} className="pt-4">
        {children}
      </div>
    </div>
  );
};
