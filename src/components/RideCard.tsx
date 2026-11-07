import React from 'react';
import { ShieldCheck, Star, Repeat } from 'lucide-react';
import type { Ride } from '../types';
import { Avatar, Badge, cx } from './ui/primitives';
import { clock24, usd } from '../lib/rides';
import GlareHover from './bits/GlareHover';

interface RideCardProps {
  ride: Ride;
  onSelect: (ride: Ride) => void;
}

export const RouteTimes: React.FC<{ ride: Ride; className?: string }> = ({ ride, className }) => (
  <div className={cx('grid grid-cols-[56px_16px_1fr] gap-x-3', className)}>
    <span className="t-h6 tabular leading-none pt-0.5">{clock24(ride.departureTime)}</span>
    <span className="relative flex justify-center row-span-3" aria-hidden="true">
      <span className="mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-accent bg-bg z-10" />
      <span className="absolute top-4 bottom-4 w-px bg-white/20" />
      <span className="absolute bottom-1 w-2.5 h-2.5 rounded-full bg-white" />
    </span>
    <div className="min-w-0 pb-1">
      <p className="text-[16px] leading-tight truncate">{ride.origin.city}</p>
      <p className="t-small text-muted truncate">{ride.origin.name}</p>
    </div>

    <span className="text-[12px] text-subtle tabular py-2">{ride.estimatedDuration}</span>
    <span className="text-[12px] text-subtle py-2 truncate">
      {ride.waypoints.length > 0 ? `Pasa por ${ride.waypoints.map((w) => w.city).join(', ')}` : 'Directo'}
    </span>

    <span className="t-h6 tabular leading-none text-muted pt-0.5">{clock24(ride.arrivalTime)}</span>
    <div className="min-w-0">
      <p className="text-[16px] leading-tight truncate">{ride.destination.city}</p>
      <p className="t-small text-muted truncate">{ride.destination.name}</p>
    </div>
  </div>
);

export const RideCard: React.FC<RideCardProps> = ({ ride, onSelect }) => {
  const full = ride.availableSeats <= 0;

  return (
    <GlareHover
      width="100%"
      height="100%"
      borderRadius="16px"
      glareColor="#21d2ed"
      glareOpacity={0.12}
      glareSize={220}
      transitionDuration={700}
      className="block"
    >
    <article
      className={cx(
        'card relative flex flex-col h-full transition-colors duration-200 hover:border-white/15 hover:bg-[#131316] group',
        full && 'opacity-70'
      )}
    >
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {ride.status === 'in_progress' ? (
              <Badge tone="accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
                En ruta
              </Badge>
            ) : (
              <Badge>{ride.date}</Badge>
            )}
            {ride.isRecurring && ride.recurringDays ? (
              <Badge icon={<Repeat className="w-3 h-3" aria-hidden="true" />}>{ride.recurringDays}</Badge>
            ) : null}
          </div>
          <div className="text-right shrink-0">
            <p className="t-h4 tabular leading-none">{usd(ride.seatPrice)}</p>
            <p className="text-[12px] text-subtle mt-1">por asiento</p>
          </div>
        </div>

        <RouteTimes ride={ride} />
      </div>

      <div className="mt-auto border-t border-line px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={ride.driver.avatar} name={ride.driver.name} size={36} />
          <div className="min-w-0">
            <p className="text-[15px] leading-tight truncate flex items-center gap-1.5">
              {ride.driver.name}
              {ride.driver.verifiedDUI ? (
                <ShieldCheck className="w-4 h-4 text-accent shrink-0" aria-label="DUI verificado" />
              ) : null}
            </p>
            <p className="t-small text-muted flex items-center gap-1 tabular">
              {ride.driver.totalTrips > 0 ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-current text-fg" aria-hidden="true" />
                  {ride.driver.rating.toFixed(2)}
                </>
              ) : (
                <span>Nuevo</span>
              )}
              <span className="text-subtle truncate">· {ride.vehicle.make} {ride.vehicle.model}</span>
            </p>
          </div>
        </div>
        <p className={cx('t-small shrink-0 tabular', full ? 'text-danger' : 'text-fg')}>
          {full ? 'Completo' : `${ride.availableSeats} ${ride.availableSeats === 1 ? 'libre' : 'libres'}`}
        </p>
      </div>

      {/* Área clicable principal (patrón "stretched link") */}
      <button
        type="button"
        onClick={() => onSelect(ride)}
        className="absolute inset-0 rounded-[16px] focus-visible:outline-2"
        aria-label={`Ver viaje ${ride.origin.city} a ${ride.destination.city}, salida ${ride.departureTime}, ${usd(
          ride.seatPrice
        )} por asiento${full ? ', completo' : ''}`}
      />

    </article>
    </GlareHover>
  );
};
