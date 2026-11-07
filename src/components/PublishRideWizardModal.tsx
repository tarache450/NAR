import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Ride } from '../types';
import { Button, Field, Modal, Stepper, cx, inputClass } from './ui/primitives';
import { DEMO_USER } from '../data/demoUser';
import { usd } from '../lib/rides';
import SquishSwitch from './bits/SquishSwitch';

interface PublishRideWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (ride: Ride) => void;
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

const to12h = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${p}`;
};
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h${m ? ` ${String(m).padStart(2, '0')}m` : ''}` : `${m}m`;
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

type Errors = Partial<Record<'originSpot' | 'destCity' | 'destSpot' | 'arrival' | 'days' | 'price' | 'car' | 'color' | 'plate', string>>;

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

export const PublishRideWizardModal: React.FC<PublishRideWizardModalProps> = ({ isOpen, onClose, onPublish }) => {
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
    setErrors((e) => ({ ...e, [k]: undefined }));
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

  const publish = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validateStep2();
    setErrors(e);
    if (Object.keys(e).length) {
      focusFirstError('publish-step2');
      return;
    }
    setSubmitting(true);

    const price = Number(Number(f.price.replace(',', '.')).toFixed(2));
    const stamp = Date.now();
    const [make, ...rest] = f.car.trim().split(/\s+/);
    const recurringDays = f.recurring ? describeDays(f.days) : undefined;
    const dep = to12h(f.departure);
    const arr = to12h(f.arrival);

    const ride: Ride = {
      id: `ride-pub-${stamp}`,
      driver: {
        id: DEMO_USER.id,
        name: DEMO_USER.name,
        role: 'Conductor',
        affiliation: 'Perfil de demostración',
        avatar: `data:image/svg+xml,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1a1a1d"/><circle cx="32" cy="25" r="11" fill="#3a3a40"/><path d="M12 56c3-11 11-16 20-16s17 5 20 16" fill="#3a3a40"/></svg>'
        )}`,
        rating: 0,
        totalTrips: 0,
        verifiedDUI: false,
        verifiedPhone: false,
        phone: '',
        memberSince: DEMO_USER.memberSince,
      },
      vehicle: {
        make: make ?? '',
        model: rest.join(' '),
        year: 0,
        type: 'Particular',
        plate: f.plate.trim().toUpperCase(),
        color: f.color.trim(),
        image: '',
        features: f.ac ? ['Aire acondicionado'] : [],
      },
      origin: {
        id: `wp-o-${stamp}`,
        name: f.originSpot.trim(),
        city: f.originCity,
        time: dep,
        type: 'origin',
        address: `${f.originSpot.trim()}, ${f.originCity}`,
      },
      waypoints:
        f.stopCity && f.stopSpot.trim()
          ? [
              {
                id: `wp-s-${stamp}`,
                name: f.stopSpot.trim(),
                city: f.stopCity,
                time: 'En ruta',
                type: 'stop',
                address: `${f.stopSpot.trim()}, ${f.stopCity}`,
              },
            ]
          : [],
      destination: {
        id: `wp-d-${stamp}`,
        name: f.destSpot.trim(),
        city: f.destCity,
        time: arr,
        type: 'destination',
        address: `${f.destSpot.trim()}, ${f.destCity}`,
      },
      date: 'Hoy',
      departureTime: dep,
      arrivalTime: arr,
      estimatedDuration: fmtDuration(toMin(f.arrival) - toMin(f.departure)),
      distanceKm: 0,
      totalSeats: f.seats,
      availableSeats: f.seats,
      seatPrice: price,
      gasContributionTotal: Number((price * f.seats).toFixed(2)),
      status: 'scheduled',
      amenities: f.ac ? ['Aire acondicionado'] : [],
      notes: f.notes.trim() || undefined,
      passengers: [],
      isRecurring: f.recurring,
      recurringDays,
    };

    window.setTimeout(() => {
      onPublish(ride);
      setF(initial);
    }, 450);
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
      eyebrow={`Publicar viaje · Paso ${step} de 2`}
      title={step === 1 ? 'Ruta y horario' : 'Asientos, aporte y vehículo'}
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
              {submitting ? 'Publicando…' : 'Publicar viaje'}
            </Button>
          )}
        </div>
      }
    >
      <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-6" aria-hidden="true">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: step === 1 ? '50%' : '100%' }} />
      </div>

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
                { v: false, l: 'Solo hoy' },
                { v: true, l: 'Se repite cada semana' },
              ].map((o) => (
                <label
                  key={String(o.v)}
                  className={cx(
                    'h-12 px-4 rounded-[12px] border flex items-center gap-3 cursor-pointer text-[15px]',
                    f.recurring === o.v ? 'border-accent bg-accent-soft' : 'border-line-strong hover:border-white/20'
                  )}
                >
                  <input type="radio" name="recurring" checked={f.recurring === o.v} onChange={() => set('recurring', o.v)} className="accent-[#21d2ed]" />
                  {o.l}
                </label>
              ))}
            </div>
            {f.recurring ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2" aria-label="Días de la semana">
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

          <Field label="Nota para los pasajeros" optional>
            {(a) => (
              <textarea
                {...a}
                rows={3}
                value={f.notes}
                onChange={(e) => set('notes', e.target.value.slice(0, 200))}
                className={cx(inputClass(), 'h-auto py-3 resize-none')}
                placeholder="Ej. Salgo en punto. Solo equipaje de mano."
              />
            )}
          </Field>

          <div className="surface-inset p-4 flex flex-col gap-2 t-small">
            <p className="text-[14px] text-fg flex items-center gap-2">
              <Check className="w-4 h-4 text-accent" aria-hidden="true" /> Resumen
            </p>
            <p className="text-muted">
              {f.originCity} ({f.originSpot}) → {f.destCity} ({f.destSpot})
            </p>
            <p className="text-muted tabular">
              Salida {to12h(f.departure)} · llegada {to12h(f.arrival)} · {f.recurring ? describeDays(f.days) : 'Solo hoy'}
            </p>
            <p className="text-muted tabular">
              {f.seats} {f.seats === 1 ? 'asiento' : 'asientos'} · {usd(Number(f.price.replace(',', '.')) || 0)} por asiento
            </p>
            <p className="text-subtle mt-1">
              Se publicará con tu perfil de demostración, marcado como “DUI sin verificar”.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
