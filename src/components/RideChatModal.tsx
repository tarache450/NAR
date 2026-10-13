import React, { useState } from 'react';
import { Ride } from '../types';
import { 
  X, 
  Send, 
  ShieldCheck, 
  MessageSquare, 
  Car,
  Sparkles 
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  avatar: string;
  isDriver?: boolean;
  text: string;
  time: string;
  isCurrentUser?: boolean;
}

interface RideChatModalProps {
  ride: Ride;
  onClose: () => void;
}

export const RideChatModal: React.FC<RideChatModalProps> = ({ ride, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: ride.driver.name,
      avatar: ride.driver.avatar,
      isDriver: true,
      text: '¡Hola a todos! Salimos puntuales desde el punto acordado. Llevo el aire acondicionado puesto y espacio en la cajuela.',
      time: '06:30 AM',
      isCurrentUser: false,
    },
    {
      id: 'm-2',
      sender: 'Elena Ramos',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      text: '¡Perfecto Miguel! Ya voy saliendo hacia la gasolinera.',
      time: '06:38 AM',
      isCurrentUser: false,
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickChips = [
    'Ya estoy en el punto de encuentro',
    'Llego en 2 minutos',
    '¿Llevas la cajuela libre para una mochila?',
    '¡Muchas gracias por el viaje!',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'Tú',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: ride.driver.name,
          avatar: ride.driver.avatar,
          isDriver: true,
          text: '¡Enterado! Te veo ahí en la orilla con las luces intermitentes puestas.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCurrentUser: false,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#131722] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col h-[580px] max-h-[85vh]">
        
        {/* Chat Header */}
        <div className="p-4 bg-[#0c0f17] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={ride.driver.avatar}
                alt={ride.driver.name}
                className="w-10 h-10 rounded-xl object-cover border border-cyan-400/30"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm text-white">
                  Chat de la Ruta
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md font-semibold">
                  PRIVADO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {ride.driver.name} · {ride.vehicle.model} ({ride.vehicle.plate})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#131722] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#090c13]/60">
          <div className="text-center my-1">
            <span className="text-[10px] font-mono text-slate-400 bg-[#131722] border border-white/5 px-3 py-1 rounded-full">
              Canal exclusivo para pasajeros confirmados de esta ruta
            </span>
          </div>

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.isCurrentUser ? 'flex-row-reverse' : ''}`}
            >
              <img
                src={m.avatar}
                alt={m.sender}
                className="w-7 h-7 rounded-lg object-cover shrink-0 mt-0.5"
              />
              <div
                className={`max-w-[78%] rounded-2xl p-3 text-xs ${
                  m.isCurrentUser
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-[#181d2a] border border-white/10 text-slate-200 rounded-tl-xs'
                }`}
              >
                {!m.isCurrentUser && (
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[11px] text-cyan-300">
                      {m.sender} {m.isDriver && '(Conductor)'}
                    </span>
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                  </div>
                )}
                <p className="leading-relaxed">{m.text}</p>
                {m.isCurrentUser && (
                  <span className="text-[9px] text-slate-800 block text-right mt-1 font-mono">
                    {m.time} · Entregado
                  </span>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px]">El conductor está respondiendo...</span>
            </div>
          )}
        </div>

        {/* Quick Chips Bar */}
        <div className="p-2 bg-[#131722] border-t border-white/5 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="whitespace-nowrap px-3 py-1 text-[11px] text-slate-300 hover:text-white bg-[#0c0f17] hover:bg-white/10 border border-white/10 rounded-xl transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0c0f17] border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe un mensaje al conductor..."
            className="flex-1 px-3.5 py-2 text-xs bg-[#131722] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleSend()}
            className="w-9 h-9 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
