import React, { useState } from 'react';
import { Ride } from '../types';
import { RideCard } from './RideCard';
import { ArrowRightLeft, Car } from 'lucide-react';

interface SearchViewProps {
  rides: Ride[];
  onSelectRide: (ride: Ride) => void;
  onOpenLiveTelemetry: (ride: Ride) => void;
  initialOrigin?: string;
  initialDestination?: string;
}

export const SearchView: React.FC<SearchViewProps> = ({
  rides,
  onSelectRide,
  onOpenLiveTelemetry,
  initialOrigin = '',
  initialDestination = '',
}) => {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(6);
  const [minRating, setMinRating] = useState<number>(4.5);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const filteredRides = rides.filter(ride => {
    const matchMetroOrigin = origin.trim().toLowerCase() === 'san salvador' &&
      ['san salvador', 'antiguo cuscatlán', 'santa tecla'].includes(ride.origin.city.toLowerCase());
    const matchOrigin = !origin.trim() || matchMetroOrigin ||
      ride.origin.name.toLowerCase().includes(origin.toLowerCase()) ||
      ride.origin.city.toLowerCase().includes(origin.toLowerCase());

    const matchDest = !destination.trim() ||
      ride.destination.name.toLowerCase().includes(destination.toLowerCase()) ||
      ride.destination.city.toLowerCase().includes(destination.toLowerCase()) ||
      ride.waypoints.some(wp => wp.name.toLowerCase().includes(destination.toLowerCase()) || wp.city.toLowerCase().includes(destination.toLowerCase()));

    const matchPrice = ride.seatPrice <= maxPrice;
    const matchRating = ride.driver.rating >= minRating;

    // Time filter
    let matchTime = true;
    const hour = parseInt(ride.departureTime.split(':')[0], 10);
    const isPM = ride.departureTime.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

    if (timeFilter === 'morning') {
      matchTime = hour24 >= 5 && hour24 <= 11;
    } else if (timeFilter === 'afternoon') {
      matchTime = hour24 >= 12 && hour24 <= 21;
    }

    return matchOrigin && matchDest && matchPrice && matchRating && matchTime;
  });

  return (
    <div className="nar-view-shell nar-search-view space-y-6">
      
      {/* Header */}
      <header className="nar-view-header">
        <p className="nar-eyebrow">ENCUENTRA TU CAMINO</p>
        <h1>Busca una ruta que vaya contigo.</h1>
        <p>Explora los trayectos de demostración por destino, horario y aporte. Comprueba siempre el punto de salida de cada ruta.</p>
      </header>

      {/* Search Filter Controls Card */}
      <div className="nar-filter-panel bg-[#131722] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Origin and Destination with Swap */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          
          <div className="md:col-span-5 relative">
            <label htmlFor="nar-advanced-origin" className="text-[10px] font-mono uppercase text-emerald-300 font-bold block mb-1">
              Origen
            </label>
            <input
              id="nar-advanced-origin"
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Ej. San Salvador, Multiplaza, Santa Tecla..."
              className="w-full min-h-[46px] px-3.5 py-2.5 text-sm bg-[#0c1017] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-1 flex justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="w-10 h-10 rounded-xl bg-[#0c1017] hover:bg-white/10 border border-white/10 text-cyan-400 flex items-center justify-center transition-colors"
              title="Invertir ciudades"
              aria-label="Invertir origen y destino"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-5 relative">
            <label htmlFor="nar-advanced-destination" className="text-[10px] font-mono uppercase text-emerald-300 font-bold block mb-1">
              Destino
            </label>
            <input
              id="nar-advanced-destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ej. Santa Ana, El Tunco, San Miguel, Sonsonate..."
              className="w-full min-h-[46px] px-3.5 py-2.5 text-sm bg-[#0c1017] border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

        </div>

        {/* Quick Filter Segments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
          
          {/* Time segment */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
              Franja Horaria
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#0c1017] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                aria-pressed={timeFilter === 'all'}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Cualquiera
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('morning')}
                aria-pressed={timeFilter === 'morning'}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeFilter === 'morning' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Mañana
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter('afternoon')}
                aria-pressed={timeFilter === 'afternoon'}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  timeFilter === 'afternoon' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Tarde
              </button>
            </div>
          </div>

          {/* Max Price */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <label htmlFor="nar-advanced-price">Aporte máximo</label>
              <span className="text-emerald-300 font-bold font-display">${maxPrice.toFixed(2)} USD</span>
            </div>
            <input 
              id="nar-advanced-price"
              type="range"
              min="2"
              max="8"
              step="0.5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-[#0c1017] rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Min Rating */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Valoración de ejemplo mínima:</span>
              <span className="text-yellow-400 font-bold">★ {minRating}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-[#0c1017] p-1 rounded-xl border border-white/5">
              {[4.5, 4.8, 4.9].map((rat) => (
                <button
                  key={rat}
                  type="button"
                  onClick={() => setMinRating(rat)}
                  aria-pressed={minRating === rat}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    minRating === rat ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  ★ {rat}+
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-mono text-slate-400">
          Se encontraron <strong className="text-white">{filteredRides.length}</strong> trayectos de ejemplo
        </span>

        {(origin || destination || timeFilter !== 'all' || maxPrice < 6 || minRating !== 4.5) && (
          <button
            onClick={() => {
              setOrigin('');
              setDestination('');
              setTimeFilter('all');
              setMaxPrice(6);
              setMinRating(4.5);
            }}
            className="text-xs text-cyan-400 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Results List */}
      {filteredRides.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {filteredRides.map(ride => (
            <RideCard
              key={ride.id}
              ride={ride}
              onSelect={onSelectRide}
              onOpenLiveTelemetry={onOpenLiveTelemetry}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-[#131722] border border-white/10 rounded-3xl">
          <Car className="w-10 h-10 text-slate-500 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-display font-bold text-white">
            Sin resultados para estos filtros
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Prueba ajustando el aporte máximo o la franja horaria para ver más opciones.
          </p>
        </div>
      )}

    </div>
  );
};
