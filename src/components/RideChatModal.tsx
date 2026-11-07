import React, { useEffect, useRef, useState } from 'react';
import { Send, Info } from 'lucide-react';
import type { Ride } from '../types';
import { Modal, cx } from './ui/primitives';
import { clock24 } from '../lib/rides';

interface ChatMessage {
  id: string;
  sender: 'driver' | 'user';
  text: string;
  auto?: boolean;
}

interface RideChatModalProps {
  ride: Ride | null;
  onClose: () => void;
}

const QUICK_REPLIES = ['Voy en camino al punto de encuentro', '¿Me confirmas el lugar exacto?', 'Llevo solo una mochila'];

export const RideChatModal: React.FC<RideChatModalProps> = ({ ride, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ride) return;
    setMessages([
      {
        id: 'm0',
        sender: 'driver',
        auto: true,
        text: `Hola. Salgo a las ${clock24(ride.departureTime)} desde ${ride.origin.name}. Avísame cuando estés cerca.`,
      },
    ]);
    setDraft('');
  }, [ride]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, typing]);

  if (!ride) return null;

  const send = (raw: string) => {
    const text = raw.trim().slice(0, 280);
    if (!text) return;
    setMessages((m) => [...m, { id: `u-${Date.now()}`, sender: 'user', text }]);
    setDraft('');
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: `d-${Date.now()}`,
          sender: 'driver',
          auto: true,
          text: `Perfecto, nos vemos en ${ride.origin.name}. Voy en ${ride.vehicle.make} ${ride.vehicle.model} ${ride.vehicle.color.toLowerCase()}, placa ${ride.vehicle.plate}.`,
        },
      ]);
    }, 900);
    inputRef.current?.focus();
  };

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={`${ride.origin.city} → ${ride.destination.city} · ${clock24(ride.departureTime)}`}
      title={`Chat con ${ride.driver.name.split(' ')[0]}`}
      footer={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="h-9 px-3 rounded-full border border-line-strong text-[13px] text-muted hover:text-fg whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Mensaje
            </label>
            <input
              ref={inputRef}
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe un mensaje"
              maxLength={280}
              autoComplete="off"
              className="flex-1 h-12 px-4 rounded-[12px] bg-surface-2 border border-line-strong text-[15px] focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Enviar mensaje"
              className="w-12 h-12 rounded-[12px] bg-white text-ink flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      }
    >
      <p className="t-small text-subtle flex gap-2 mb-5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        Chat de demostración: las respuestas del conductor son automáticas.
      </p>
      <div className="flex flex-col gap-3 min-h-[220px]" role="log" aria-live="polite" aria-label="Mensajes">
        {messages.map((m) => (
          <div key={m.id} className={cx('flex', m.sender === 'user' ? 'justify-end' : 'justify-start')}>
            <p
              className={cx(
                'max-w-[80%] px-4 py-3 text-[15px] leading-snug rounded-[16px]',
                m.sender === 'user' ? 'bg-white text-ink rounded-br-[6px]' : 'bg-surface-2 border border-line rounded-bl-[6px]'
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {typing ? (
          <p className="t-small text-muted" aria-live="polite">
            {ride.driver.name.split(' ')[0]} está escribiendo…
          </p>
        ) : null}
        <div ref={endRef} />
      </div>
    </Modal>
  );
};
