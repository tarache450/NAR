import React, { useState } from 'react';
import { Ride } from '../types';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  CheckCircle2,
  Info,
  ArrowRight,
  ArrowLeft,
  Coins,
  Sparkles
} from 'lucide-react';

interface PublishRideWizardModalProps {
  onClose: () => void;
  onPublish: (newRide: Ride) => void;
}

export const PublishRideWizardModal: React.FC<PublishRideWizardModalProps> = ({
  onClose,
  onPublish,
}) => {
  const [step, setStep] = useState<number>(1);
  const todayInElSalvador = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/El_Salvador', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  // Form states
  const [originCity, setOriginCity] = useState('San Salvador (Multiplaza)');
  const [originAddress, setOriginAddress] = useState('Bahía frente a Las Cascadas, Antiguo Cuscatlán');
  const [destinationCity, setDestinationCity] = useState('Santa Ana (Metrocentro)');
  const [destinationAddress, setDestinationAddress] = useState('Boulevard Los 44, entrada principal');
  const [intermediateStop, setIntermediateStop] = useState('Santa Tecla (Parque San Martín)');
  const [departureDate, setDepartureDate] = useState(todayInElSalvador);
  const [departureTime, setDepartureTime] = useState('06:30');
  const [seats, setSeats] = useState<number>(3);
  const [pricePerSeat, setPricePerSeat] = useState<number>(3.50);
  const [carModel, setCarModel] = useState('Toyota Corolla 2023');
  const [amenities, setAmenities] = useState<string[]>(['Aire acondicionado', 'Música tranquila', 'No fumar']);
  const [isDone, setIsDone] = useState(false);

  const quickCitiesOrigin = ['San Salvador', 'Santa Tecla', 'Antiguo Cuscatlán', 'Soyapango'];
  const quickCitiesDest = ['Santa Ana', 'San Miguel', 'La Libertad / El Tunco', 'Sonsonate', 'Chalatenango'];

  const handleNext = () => {
    if (step === 1 && (!originCity.trim() || !destinationCity.trim())) {
      window.alert('Indica una ciudad de salida y otra de destino.');
      return;
    }
    if (step === 3 && (departureDate < todayInElSalvador || !departureTime)) {
      window.alert('Elige una fecha de hoy en adelante y una hora de salida.');
      return;
    }
    if (step === 4 && (!Number.isFinite(pricePerSeat) || pricePerSeat <= 0)) {
      window.alert('Añade un aporte ilustrativo mayor que cero.');
      return;
    }
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    if (!carModel.trim()) {
      window.alert('Añade un modelo de vehículo de ejemplo para continuar.');
      return;
    }
    setIsDone(true);

    const timeAfter = (minutes: number) => {
      const [hour, minute] = departureTime.split(':').map(Number);
      const total = (hour * 60 + minute + minutes) % (24 * 60);
      return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    };
    const newRide: Ride = {
      id: `ride-sv-${Date.now().toString().slice(-4)}`,
      driver: {
        id: 'drv-current-user',
        name: 'Conductor de ejemplo',
        role: 'Perfil ilustrativo',
        affiliation: 'NAR · demostración',
        avatar: '/logo.svg',
        rating: 0,
        totalTrips: 0,
        verifiedDUI: false,
        verifiedPhone: false,
        phone: '',
        memberSince: 'No aplica',
        bio: 'Datos creados localmente para ilustrar el formulario.',
        reviews: [],
      },
      vehicle: {
        make: carModel.split(' ')[0] || 'Toyota',
        model: carModel,
        year: 2024,
        type: 'Sedán Familiar',
        plate: 'No especificada',
        color: 'Gris Oscuro',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        features: amenities,
      },
      origin: {
        id: `w-orig-${Date.now()}`,
        name: originCity,
        city: originCity.split('(')[0].trim(),
        time: departureTime,
        type: 'origin',
        address: originAddress,
      },
      waypoints: intermediateStop ? [
        {
          id: `w-stop-${Date.now()}`,
          name: intermediateStop,
          city: intermediateStop.split('(')[0].trim(),
          time: timeAfter(30),
          type: 'stop',
          address: 'Punto intermedio sobre la carretera',
        }
      ] : [],
      destination: {
        id: `w-dest-${Date.now()}`,
        name: destinationCity,
        city: destinationCity.split('(')[0].trim(),
        time: timeAfter(75),
        type: 'destination',
        address: destinationAddress,
      },
      date: departureDate,
      departureTime,
      arrivalTime: timeAfter(75),
      estimatedDuration: '1h 15m',
      distanceKm: 64.0,
      totalSeats: seats,
      availableSeats: seats,
      seatPrice: pricePerSeat,
      gasContributionTotal: pricePerSeat * seats,
      status: 'scheduled',
      amenities,
      notes: 'Trayecto regular de trabajo. Puntualidad en el punto de encuentro.',
      passengers: [],
    };

    setTimeout(() => {
      onPublish(newRide);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#131722] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">

        {/* Header with step progress indicator (Ref 4 Style) */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#1c2233] to-[#131722] border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#9cb3ff]">
              Paso {step} de 5 · Publicar Asiento
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#0c0f17] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar line */}
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#315cff] to-[#00a89d] rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">Formulario de demostración. Los datos se agregan solo a esta página y no se envían ni se guardan en un servidor.</p>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-5 sm:p-6 min-h-[300px] flex flex-col justify-between">

          {/* STEP 1: Origen */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">
                  ¿De dónde sales?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Elige una ciudad y un punto ilustrativos para la ruta de muestra.
                </p>
              </div>

              {/* Quick city suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {quickCitiesOrigin.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setOriginCity(c)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      originCity.includes(c)
                        ? 'bg-[#315cff]/20 text-[#c4cfff] border-[#315cff]'
                        : 'bg-[#0c0f17] text-slate-400 border-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Zona o Punto Exacto
                </label>
                <input
                  type="text"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  placeholder="Ej. Multiplaza / Plaza Salvador del Mundo"
                  className="w-full p-3 text-sm bg-[#0c0f17] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#315cff]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Referencia de parada
                </label>
                <input
                  type="text"
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  placeholder="Ej. Gasolinera Puma frente a Las Cascadas"
                  className="w-full p-3 text-sm bg-[#0c0f17] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#315cff]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Destino */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">
                  ¿A dónde te diriges?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Añade el destino y las paradas que quieres mostrar en esta demostración.
                </p>
              </div>

              {/* Quick destination suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {quickCitiesDest.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDestinationCity(c)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      destinationCity.includes(c)
                        ? 'bg-[#315cff]/20 text-[#c4cfff] border-[#315cff]'
                        : 'bg-[#0c0f17] text-slate-400 border-white/10'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Ciudad o Destino Final
                </label>
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="Ej. Santa Ana / El Tunco"
                  className="w-full p-3 text-sm bg-[#0c0f17] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#315cff]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Parada intermedia en el camino (Opcional)
                </label>
                <input
                  type="text"
                  value={intermediateStop}
                  onChange={(e) => setIntermediateStop(e.target.value)}
                  placeholder="Ej. Santa Tecla (Paseo El Carmen / Parque San Martín)"
                  className="w-full p-3 text-sm bg-[#0c0f17] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#315cff]"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Solo si pasa por tu camino directo, sin desvíos molestos.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Fecha y Hora */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">
                  ¿Cuándo sales?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hora puntual de salida desde tu punto de partida.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ride-date" className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Día del viaje
                  </label>
                  <input
                    id="ride-date"
                    type="date"
                    min={todayInElSalvador}
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full p-3 text-sm bg-[#0c0f17] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#315cff]"
                  />
                </div>

                <div>
                  <label htmlFor="ride-time" className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Hora de salida
                  </label>
                  <input
                    id="ride-time"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full p-3 text-sm bg-[#0c0f17] border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#315cff]"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: Asientos y Aporte de Gasolina */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">
                  Asientos & Aporte de Gasolina
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  El aporte cubre proporcionalmente combustible y peajes. No es cobro con fines de lucro.
                </p>
              </div>

              {/* Seats count */}
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Plazas libres en tu vehículo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSeats(n)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                        seats === n
                          ? 'bg-[#315cff] text-slate-950 shadow-md'
                          : 'bg-[#0c0f17] text-slate-400 border border-white/10'
                      }`}
                    >
                      {n} {n === 1 ? 'asiento' : 'asientos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price per seat in USD ($) */}
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Aporte sugerido por persona (USD $)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(Number(e.target.value))}
                    className="flex-1 p-3 text-lg font-bold bg-[#0c0f17] border border-white/10 rounded-2xl text-[#c4cfff] focus:outline-none focus:border-[#315cff]"
                  />
                  <span className="text-xs text-slate-400 font-mono">USD</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Cantidad ilustrativa; el prototipo no procesa aportes ni pagos.
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: Vehículo y Preferencias */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">
                  Tu Vehículo & Reglas
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Datos de prueba. No introduzcas placa ni información personal real.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Modelo del auto
                  </label>
                  <input
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="Toyota Corolla"
                    className="w-full p-2.5 text-xs bg-[#0c0f17] border border-white/10 rounded-xl text-white"
                  />
                </div>

              </div>

              {/* Trust badge note */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
                <Info className="w-5 h-5 shrink-0" />
                <span>
                  Esta información solo se conserva temporalmente en esta demostración. NAR no verifica identidades ni vehículos.
                </span>
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-3 mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#0c0f17] border border-white/10 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Atrás</span>
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#315cff] hover:bg-cyan-300 shadow-md shadow-[#315cff]/20 flex items-center gap-1.5 ml-auto"
              >
                <span>Continuar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isDone}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-[#315cff] to-[#00a89d] hover:from-[#4d77ff] hover:to-[#22c4b7] shadow-lg shadow-[#315cff]/25 flex items-center gap-1.5 ml-auto"
              >
                {isDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Probar publicación</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
