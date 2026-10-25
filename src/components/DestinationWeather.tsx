import { useEffect, useState } from 'react';
import { CloudSun, RefreshCw } from 'lucide-react';

const destinations = [
  { names: ['santa ana'], label: 'Santa Ana', latitude: 13.9942, longitude: -89.5597 },
  { names: ['el tunco', 'la libertad', 'libertad'], label: 'El Tunco', latitude: 13.4938, longitude: -89.3841 },
  { names: ['san miguel'], label: 'San Miguel', latitude: 13.4833, longitude: -88.1833 },
  { names: ['sonsonate'], label: 'Sonsonate', latitude: 13.7189, longitude: -89.7242 },
  { names: ['san salvador'], label: 'San Salvador', latitude: 13.6929, longitude: -89.2182 },
];

type WeatherState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; temperature: number; code: number; time: string };

function describeWeather(code: number) {
  if (code === 0) return 'Despejado';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Niebla';
  if (code <= 67) return 'Lluvia';
  if (code <= 82) return 'Chubascos';
  if (code >= 95) return 'Tormenta';
  return 'Variable';
}

export function DestinationWeather({ destination }: { destination: string }) {
  const [attempt, setAttempt] = useState(0);
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading' });
  const query = destination.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const place = destinations.find(({ names }) => names.some((name) => query === name || query.startsWith(`${name},`)));

  useEffect(() => {
    if (!place) return;
    const controller = new AbortController();
    setWeather({ status: 'loading' });
    const timer = window.setTimeout(async () => {
      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.search = new URLSearchParams({
          latitude: String(place.latitude),
          longitude: String(place.longitude),
          current: 'temperature_2m,weather_code',
          timezone: 'America/El_Salvador',
        }).toString();
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        const current = (data as { current?: { temperature_2m?: unknown; weather_code?: unknown; time?: unknown } }).current;
        if (typeof current?.temperature_2m !== 'number' || typeof current.weather_code !== 'number' || typeof current.time !== 'string') {
          throw new Error('Respuesta meteorológica incompleta');
        }
        setWeather({ status: 'success', temperature: current.temperature_2m, code: current.weather_code, time: current.time });
      } catch (error) {
        if (!controller.signal.aborted) setWeather({ status: 'error' });
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [place?.label, attempt]);

  if (!place) return null;

  return (
    <aside className="nar-weather" aria-label={`Tiempo actual en ${place.label}`} aria-live="polite">
      <CloudSun size={22} aria-hidden="true" />
      <div className="nar-weather-copy">
        <strong>Tiempo en {place.label}</strong>
        {weather.status === 'loading' && <span>Cargando información actual…</span>}
        {weather.status === 'error' && <span>No pudimos consultar el tiempo. <button type="button" onClick={() => setAttempt((value) => value + 1)}>Reintentar</button></span>}
        {weather.status === 'success' && <span>{Math.round(weather.temperature)} °C · {describeWeather(weather.code)} · Actualizado {weather.time.slice(11, 16)} h</span>}
      </div>
      {weather.status === 'success' && <RefreshCw size={15} aria-hidden="true" />}
      <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Datos: Open-Meteo</a>
    </aside>
  );
}
