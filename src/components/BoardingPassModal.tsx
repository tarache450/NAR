import React, { useState } from 'react';
import { Check, Copy, MessageSquare, Navigation, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Booking, Ride } from '../types';
import { Button, Modal, ShaderBars } from './ui/primitives';
import { clock24, usd } from '../lib/rides';
import StatusMark from './bits/StatusMark';
import DecryptedText from './bits/DecryptedText';

interface BoardingPassModalProps {
  booking: Booking | null;
  onClose: () => void;
  onOpenTrip: (ride: Ride) => void;
  onOpenChat: (ride: Ride) => void;
}

export const BoardingPassModal: React.FC<BoardingPassModalProps> = ({ booking, onClose, onOpenTrip, onOpenChat }) => {
  const [copied, setCopied] = useState(false);
  if (!booking) return null;
  const { ride } = booking;

  const copy = async () => {
    const text = `Reserva NAR ${booking.id} · PIN ${booking.securityPin} · ${ride.origin.city} → ${ride.destination.city} ${ride.departureTime}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={
        <span className="inline-flex items-center gap-2">
          <StatusMark status="done" size={16} strokeWidth={2} doneColor="#21d2ed" />
          Reserva confirmada
        </span>
      }
      title="Tu pase de abordaje"
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => onOpenChat(ride)}>
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Escribir
          </Button>
          <Button onClick={() => onOpenTrip(ride)}>
            <Navigation className="w-4 h-4" aria-hidden="true" />
            Ver mi viaje
          </Button>
        </div>
      }
    >
      <div className="card overflow-hidden">
        <div className="relative px-5 pt-6 pb-10 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-full opacity-70">
            <ShaderBars bias={0.85} density={6} />
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="t-small text-muted">Salida</p>
              <p className="t-h3 tabular">{clock24(ride.departureTime)}</p>
              <p className="text-[16px] mt-1">{ride.origin.city}</p>
            </div>
            <div className="text-right">
              <p className="t-small text-muted">Llegada</p>
              <p className="t-h3 tabular text-muted">{clock24(ride.arrivalTime)}</p>
              <p className="text-[16px] mt-1">{ride.destination.city}</p>
            </div>
          </div>
        </div>

        <div className="relative border-t border-dashed border-white/20">
          <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-bg border border-line" aria-hidden="true" />
          <span className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-bg border border-line" aria-hidden="true" />
        </div>

        <div className="p-5 flex flex-col items-center text-center gap-3">
          {/* Código QR Verídico */}
          <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center">
            <QRCodeSVG
              value={`https://nar.app/verify/${booking.id}?pin=${booking.securityPin.replace('-', '')}`}
              size={135}
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="mt-1">
            <p className="t-tag text-accent">PIN DE ABORDAJE</p>
            <p className="text-[44px] font-bold leading-none tracking-[0.14em] tabular mt-1 text-white">
              <span className="sr-only">PIN {booking.securityPin.split('').join(' ')}</span>
              <span aria-hidden="true">
                <DecryptedText
                  text={booking.securityPin}
                  animateOn="view"
                  sequential
                  revealDirection="start"
                  speed={45}
                  characters="0123456789"
                  encryptedClassName="text-accent"
                />
              </span>
            </p>
          </div>
          <p className="t-small text-muted max-w-[320px]">
            Muestra este código QR o tu PIN al conductor antes de abordar para verificar tu asiento.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-line border-t border-line">
          {[
            ['Reserva', booking.id],
            ['Pasajero', booking.passengerName],
            ['Subes en', booking.pickupPoint],
            ['Asientos', `${booking.seatsBooked} · ${usd(booking.totalPrice)}`],
            ['Conductor', ride.driver.name],
            ['Vehículo', `${ride.vehicle.make} ${ride.vehicle.model} · ${ride.vehicle.plate}`],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface p-4 min-w-0">
              <dt className="t-small text-muted">{k}</dt>
              <dd className="text-[15px] mt-0.5 break-words">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Button variant="ghost" size="sm" onClick={copy} className="mt-4 -ml-3">
        {copied ? <Check className="w-4 h-4 text-accent" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Datos copiados' : 'Copiar datos de la reserva'}</span>
      </Button>
    </Modal>
  );
};
