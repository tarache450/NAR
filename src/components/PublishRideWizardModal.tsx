import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import type { Ride } from '../types';
import { Button, Field, Modal, Stepper, cx, inputClass } from './ui/primitives';
import { usd } from '../lib/rides';
import SquishSwitch from './bits/SquishSwitch';
import { useAuth } from '../context/AuthContext';
import { publishLiveRide } from '../lib/ridesApi';

interface PublishRideWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (ride: Ride) => void;
  onOpenAuth?: () => void;
}

const SV_CITIES = [
  'San Salvador',
  'Santa Tecla',
  'Antiguo Cuscatlán',
  'Santa Ana',
  'La Libertad',
  'San Miguel',
  'Sonsonate',
  'Colón',
  'Zaragoza',
  'Cojutepeque',
  'San Vicente',
  'Izalco',
];

const WEEK = [
  { d: 1, l: 'Lun' },
  { d: 2, l: 'Mar' },
  { d: 3, l: 'Mié' },
  { d: 4, l: 'Jue' },
  { d: 5, l: 'Vie' },
  { d: 6, l: 'Sáb' },
  { d: 0, l: 'Dom' },
];
const FULL_DAY: Record<number, string> = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Describe los días elegidos: rangos consecutivos como "Lunes a Viernes". */
export const describeDays = (days: number[]) => {
  const order = WEEK.map((w) => w.d).filter((d) => days.includes(d));
  if (!order.length) return '';
  const idx = order.map((d) => WEEK.findIndex((w) => w.d === d));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (consecutive && order.length >= 3) return `${FULL_DAY[order[0]]} a ${FULL_DAY[order[order.length - 1]]}`;
  return order.map((d) => FULL_DAY[d]).join(order.length === 2 ? ' y ' : ', ');
};

type Errors = Partial<Record<'originSpot' | 'destCity' | 'destSpot' | 'arrival' | 'days' | 'price' | 'car' | 'color' | 'plate' | 'general', string>>;

const initial = {
  originCity: 'Santa Tecla',
  originSpot: '',
  stopCity: '',
  stopSpot: '',
  destCity: 'San Salvador',
  destSpot: '',
  departure: '07:00',
  arrival: '07:45',
  recurring: false,
  days: [1, 2, 3, 4, 5] as number[],
  seats: 3,
  price: '3.00',
  car: '',
  color: '',
  plate: '',
  ac: true,
  notes: '',
};

export const PublishRideWizardModal: React.FC<PublishRideWizardModalProps> = ({ isOpen, onClose, onPublish, onOpenAuth }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined, general: undefined }));
  };

  const validateStep1 = (): Errors => {
    const e: Errors = {};
    if (f.originSpot.trim().length < 3) e.originSpot = 'Indica un punto de encuentro reconocible, por ejemplo una gasolinera o un centro comercial.';
    if (f.destCity === f.originCity) e.destCity = 'El destino debe ser una ciudad distinta al origen.';
    if (f.destSpot.trim().length < 3) e.destSpot = 'Indica dónde dejarás a los pasajeros.';
    if (toMin(f.arrival) <= toMin(f.departure)) e.arrival = 'La llegada tiene que ser posterior a la hora de salida.';
    if (f.recurring && f.days.length === 0) e.days = 'Elige al menos un día de la semana.';
    return e;
  };

  const validateStep2 = (): Errors => {
    const e: Errors = {};
    const price = Number(f.price.replace(',', '.'));
    if (!Number.isFinite(price) || price < 0.5 || price > 25) e.price = 'El aporte debe estar entre $0.50 y $25.00.';
    if (f.car.trim().length < 3) e.car = 'Escribe marca y modelo, por ejemplo “Toyota Corolla”.';
    if (f.color.trim().length < 3) e.color = 'Indica el color para que te reconozcan.';
    if (!/^[A-Z]{1,2}\s?\d{3}[-\s]?\d{3}$/i.test(f.plate.trim())) e.plate = 'Usa el formato de placa salvadoreña, por ejemplo P 123-456.';
    return e;
  };

  const focusFirstError = (formId: string) =>
    window.requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`#${formId} [aria-invalid="true"]`)?.focus()
    );

  const next = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep1();
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError('publish-step1');
      return;
    }
    setStep(2);
  };

  const publish = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2();
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError('publish-step2');
      return;
    }

    if (!user) {
      if (onOpenAuth) {
        onClose();
        onOpenAuth();
      } else {
        setErrors({ general: 'Debes iniciar sesión para publicar un viaje verídico en NAR.' });
      }
      return;
    }

    setSubmitting(true);

    const price = Number(Number(f.price.replace(',', '.')).toFixed(2));
    const [make, ...rest] = f.car.trim().split(/\s+/);
    const recurringDays = f.recurring ? describeDays(f.days) : undefined;

    const res = await publishLiveRide(
      {
        originCity: f.originCity,
        originSpot: f.originSpot.trim(),
        stopCity: f.stopCity,
        stopSpot: f.stopSpot.trim(),
        destCity: f.destCity,
        destSpot: f.destSpot.trim(),
        departure: f.departure,
        arrival: f.arrival,
        seats: f.seats,
        price,
        carBrand: make || 'Vehículo',
        carModel: rest.join(' ') || 'Sedán',
        plate: f.plate.trim().toUpperCase(),
        color: f.color.trim(),
        recurring: f.recurring,
        recurringDays,
        notes: f.notes.trim() || undefined,
        hasAC: f.ac,
      },
      user.id
    );

    setSubmitting(false);

    if (res.success && res.ride) {
      onPublish(res.ride);
      setF(initial);
    } else {
      setErrors({ general: res.error || 'Error al guardar el viaje en Supabase.' });
    }
  };

  const cityOptions = (exclude?: string) =>
    SV_CITIES.filter((c) => c !== exclude).map((c) => (
      <option key={c} value={c}>
        {c}
      </option>
    ));

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={`Registro de Conductor NAR · Paso ${step} de 2`}
      title={step === 1 ? 'Ruta habitual y horario' : 'Vehículo, asientos y aporte'}
      footer={
        <div className="flex items-center justify-between gap-3">
          {step === 2 ? (
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Atrás
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          )}
          {step === 1 ? (
            <Button type="submit" form="publish-step1">
              Continuar
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button type="submit" form="publish-step2" loading={submitting}>
              {submitting ? 'Registrando…' : 'Registrar como conductor'}
            </Button>
          )}
        </div>
      }
    >
      <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-6" aria-hidden="true">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: step === 1 ? '50%' : '100%' }} />
      </div>

      {!user && (
        <div className="mb-6 p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between gap-3 text-xs text-white">
          <span>Inicia sesión para vincular este viaje a tu perfil de conductor en Supabase.</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAuth?.();
            }}
            className="underline font-bold text-accent cursor-pointer shrink-0"
          >
            Ingresar
          </button>
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/30 flex items-center gap-2 text-xs text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {step === 1 ? (
        <form id="publish-step1" onSubmit={next} noValidate className="flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Ciudad de salida">
              {(a) => (
                <select {...a} value={f.originCity} onChange={(e) => set('originCity', e.target.value)} className={inputClass()}>
                  {cityOptions()}
                </select>
              )}
            </Field>
            <Field label="Punto de encuentro" error={errors.originSpot}>
              {(a) => (
                <input {...a} value={f.originSpot} onChange={(e) => set('originSpot', e.target.value)} className={inputClass(!!errors.originSpot)} placeholder="Ej. Gasolinera Puma, Paseo El Carmen" />
              )}
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Parada intermedia" optional>
              {(a) => (
                <select {...a} value={f.stopCity} onChange={(e) => set('stopCity', e.target.value)} className={inputClass()}>
                  <option value="">Sin parada</option>
                  {cityOptions(f.originCity)}
                </select>
              )}
            </Field>
            <Field label="Lugar de la parada" optional>
              {(a) => (
                <input
                  {...a}
                  value={f.stopSpot}
                  disabled={!f.stopCity}
                  onChange={(e) => set('stopSpot', e.target.value)}
                  className={cx(inputClass(), !f.stopCity && 'opacity-50')}
                  placeholder={f.stopCity ? 'Ej. Pasarela, centro comercial' : 'Elige primero una ciudad'}
                />
              )}
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Ciudad de llegada" error={errors.destCity}>
              {(a) => (
                <select {...a} value={f.destCity} onChange={(e) => set('destCity', e.target.value)} className={inputClass(!!errors.destCity)}>
                  {cityOptions()}
                </select>
              )}
            </Field>
            <Field label="Punto de llegada" error={errors.destSpot}>
              {(a) => (
                <input {...a} value={f.destSpot} onChange={(e) => set('destSpot', e.target.value)} className={inputClass(!!errors.destSpot)} placeholder="Ej. Torre Futura, Escalón" />
              )}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Hora de salida">
              {(a) => <input {...a} type="time" value={f.departure} onChange={(e) => set('departure', e.target.value)} className={inputClass()} />}
            </Field>
            <Field label="Llegada estimada" error={errors.arrival}>
              {(a) => <input {...a} type="time" value={f.arrival} onChange={(e) => set('arrival', e.target.value)} className={inputClass(!!errors.arrival)} />}
            </Field>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="text-[14px] mb-3">¿Cuándo sales?</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {[
                { r: false, title: 'Solo un viaje', desc: 'Para este día específico' },
                { r: true, title: 'Ruta diaria recurrente', desc: 'Repetir cada semana' },
              ].map((opt) => {
                const on = f.recurring === opt.r;
                return (
                  <button
                    key={String(opt.r)}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set('recurring', opt.r)}
                    className={cx(
                      'p-4 rounded-[12px] border text-left transition-colors flex flex-col justify-between gap-2',
                      on ? 'border-accent bg-accent/5' : 'border-line hover:border-line-strong'
                    )}
                  >
                    <span className="flex items-center justify-between w-full">
                      <span className="text-[15px]">{opt.title}</span>
                      <span
                        className={cx(
                          'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                          on ? 'border-accent bg-accent' : 'border-line-strong'
                        )}
                        aria-hidden="true"
                      >
                        {on ? <Check className="w-2.5 h-2.5 text-ink stroke-[3]" /> : null}
                      </span>
                    </span>
                    <span className="t-small text-muted">{opt.desc}</span>
                  </button>
                );
              })}
            </div>

            {f.recurring ? (
              <div className="flex flex-col gap-2 pt-2">
                <p className="t-small text-muted">Días que haces este viaje</p>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Días recurrentes">
                  {WEEK.map((w) => {
                    const on = f.days.includes(w.d);
                    return (
                      <button
                        key={w.d}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set('days', on ? f.days.filter((d) => d !== w.d) : [...f.days, w.d])}
                        className={cx(
                          'w-12 h-11 rounded-[10px] border text-[14px] transition-colors',
                          on ? 'bg-white text-ink border-white' : 'border-line-strong text-muted hover:text-fg'
                        )}
                      >
                        {w.l}
                      </button>
                    );
                  })}
                </div>
                {errors.days ? (
                  <p className="text-[13px] text-danger">{errors.days}</p>
                ) : (
                  <p className="text-[13px] text-subtle">{describeDays(f.days)}</p>
                )}
              </div>
            ) : null}
          </fieldset>
        </form>
      ) : (
        <form id="publish-step2" onSubmit={publish} noValidate className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[14px]">Asientos que ofreces</p>
              <p className="t-small text-muted">Entre 1 y 4</p>
            </div>
            <Stepper label="Asientos ofrecidos" value={f.seats} min={1} max={4} onChange={(v) => set('seats', v)} />
          </div>

          <Field label="Aporte por asiento (USD)" error={errors.price} hint="Entre $0.50 y $25.00. Lo verán los pasajeros antes de reservar.">
            {(a) => (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true">
                  $
                </span>
                <input
                  {...a}
                  inputMode="decimal"
                  value={f.price}
                  onChange={(e) => set('price', e.target.value)}
                  className={cx(inputClass(!!errors.price), 'pl-8 tabular')}
                />
              </div>
            )}
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Marca y modelo" error={errors.car}>
              {(a) => <input {...a} value={f.car} onChange={(e) => set('car', e.target.value)} className={inputClass(!!errors.car)} placeholder="Ej. Toyota Corolla" />}
            </Field>
            <Field label="Color" error={errors.color}>
              {(a) => <input {...a} value={f.color} onChange={(e) => set('color', e.target.value)} className={inputClass(!!errors.color)} placeholder="Ej. Gris" />}
            </Field>
          </div>

          <Field label="Placa" error={errors.plate}>
            {(a) => (
              <input
                {...a}
                value={f.plate}
                onChange={(e) => set('plate', e.target.value.toUpperCase())}
                className={cx(inputClass(!!errors.plate), 'tabular uppercase')}
                placeholder="P 123-456"
                autoCapitalize="characters"
              />
            )}
          </Field>

          <div className="flex items-center justify-between gap-3 text-[15px]">
            <span>El carro tiene aire acondicionado</span>
            <SquishSwitch
              checked={f.ac}
              onChange={(v) => set('ac', v)}
              ariaLabel="El carro tiene aire acondicionado"
              trackColor="rgba(255,255,255,0.12)"
              trackOnColor="#21d2ed"
              thumbColor="#ffffff"
              thumbOnColor="#09090b"
              width={46}
              height={26}
            />
          </div>

          <Field label="Indicaciones para los pasajeros" optional hint="Dónde esperar, equipaje permitido o detalles para encontrarse rápido.">
            {(a) => (
              <textarea
                {...a}
                rows={2}
                value={f.notes}
                onChange={(e) => set('notes', e.target.value)}
                className={inputClass()}
                placeholder="Ej. Salgo puntual, espero 5 minutos. Baúl mediano disponible."
              />
            )}
          </Field>

          <div className="p-4 rounded-[12px] bg-white/[0.03] border border-line flex items-center justify-between">
            <div>
              <p className="t-small text-muted">Aporte total estimado</p>
              <p className="text-[14px]">
                {f.seats} {f.seats === 1 ? 'asiento' : 'asientos'} × {usd(Number(f.price) || 0)}
              </p>
            </div>
            <p className="t-h3 tabular text-accent">{usd(f.seats * (Number(f.price) || 0))}</p>
          </div>
        </form>
      )}
    </Modal>
  );
};
