import React from 'react';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import { Ride } from '../types';

interface RideCardProps {
  ride: Ride;
  onSelect: (ride: Ride) => void;
  onOpenLiveTelemetry?: (ride: Ride) => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onSelect, onOpenLiveTelemetry }) => {
  const stops = [ride.origin, ...ride.waypoints, ride.destination];

  return (
    <article className="nar-trip-card group">
      <header className="nar-trip-card__header">
        <div className="nar-trip-card__summary">
          <span className="nar-trip-card__eyebrow">RECORRIDO DE EJEMPLO</span>
          <div className="nar-trip-card__facts">
            <span><Clock size={13} aria-hidden="true" /> {ride.estimatedDuration}</span>
            <i aria-hidden="true" />
            <span>{ride.waypoints.length} {ride.waypoints.length === 1 ? 'parada' : 'paradas'}</span>
          </div>
        </div>
        <div className="nar-trip-card__price">
          <span>Aporte ilustrativo</span>
          <strong>${ride.seatPrice.toFixed(2)}</strong>
          <small>USD · por asiento</small>
        </div>
      </header>

      <ol className="nar-trip-stops" aria-label={`Recorrido de ${ride.origin.city} a ${ride.destination.city}`}>
        {stops.map((stop, index) => {
          const first = index === 0;
          const last = index === stops.length - 1;
          const waypoint = !first && !last;
          return (
            <li key={stop.id} className={`nar-trip-stop${first ? ' is-origin' : ''}${waypoint ? ' is-waypoint' : ''}${last ? ' is-destination' : ''}`}>
              <time>{stop.time}</time>
              <span className="nar-trip-stop__node" aria-hidden="true" />
              <span className="nar-trip-stop__place">
                <strong>{stop.city}</strong>
                <small>{stop.name}</small>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="nar-trip-driver">
        <img
          src={ride.driver.avatar}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="nar-trip-driver__identity">
          <span>Perfil de demostración</span>
          <strong>Conductor de ejemplo</strong>
          <small>{ride.vehicle.make} {ride.vehicle.model.split(' ')[0]} · {ride.vehicle.color}</small>
        </div>
        <span className={`nar-trip-seats${ride.availableSeats === 1 ? ' is-limited' : ''}`}>
          {ride.availableSeats} {ride.availableSeats === 1 ? 'plaza libre' : 'plazas libres'}
        </span>
      </div>

      <div className="nar-trip-amenities" aria-label="Detalles ilustrativos del viaje">
        {ride.amenities.slice(0, 2).map((amenity) => <span key={amenity}>{amenity}</span>)}
      </div>

      <footer className="nar-trip-actions">
        <button
          type="button"
          onClick={() => onSelect(ride)}
          className="nar-trip-details"
          aria-label={`Ver itinerario de ejemplo: ${ride.origin.city} a ${ride.destination.city}`}
        >
          Ver itinerario <ArrowRight size={16} aria-hidden="true" />
        </button>
        {onOpenLiveTelemetry && (
          <button
            type="button"
            onClick={() => onOpenLiveTelemetry(ride)}
            className="nar-trip-map"
            aria-label={`Ver mapa de ejemplo: ${ride.origin.city} a ${ride.destination.city}`}
            title="Ver mapa de ejemplo"
          >
            <MapPin size={16} aria-hidden="true" />
            <span>Mapa</span>
          </button>
        )}
      </footer>
    </article>
  );
};
