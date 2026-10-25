import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, ArrowRightLeft, CalendarDays, CarFront, Check, MapPin, Plus, Search, Users, X } from 'lucide-react';
import { api, post, type Notification, type SeatRequest, type Trip, type User } from './api/client';
import { trackProductEvent } from './analytics/events';
import './styles/marketplace.css';

type View = 'search' | 'publish' | 'activity';
const cities = ['San Salvador', 'Santa Tecla', 'Antiguo Cuscatlán', 'Soyapango', 'Santa Ana', 'San Miguel', 'Sonsonate', 'La Libertad', 'Chalatenango'];
const money = (cents: number) => new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(cents / 100);
const todayInSalvador = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/El_Salvador', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const dateLabel = (date: string) => new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

export default function MarketplaceApp() {
  const [view, setView] = useState<View>('search');
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState({ from: '', to: '', date: '', seats: 1 });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activity, setActivity] = useState<{ passenger: SeatRequest[]; driver: SeatRequest[] }>({ passenger: [], driver: [] });
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [requestDraft, setRequestDraft] = useState<{ trip: Trip; pickupId: string; dropoffId: string; seats: number } | null>(null);
  const [requestError, setRequestError] = useState('');
  const [requestBusy, setRequestBusy] = useState(false);

  const loadTrips = async (params = searched ? search : null) => {
    setLoading(true); setError('');
    try {
      const query = params ? `?${new URLSearchParams({ from: params.from, to: params.to, ...(params.date ? { date: params.date } : {}), seats: String(params.seats) })}` : '';
      const result = await api<{ trips: Trip[] }>(`/trips${query}`);
      setTrips(result.trips);
      if (params) trackProductEvent('search_completed', result.trips.length);
    } catch (cause) { setError((cause as Error).message); }
    finally { setLoading(false); }
  };
  const loadActivity = async () => {
    try {
      const [requests, mine, alerts] = await Promise.all([
        api<{ passenger: SeatRequest[]; driver: SeatRequest[] }>('/requests/mine'),
        api<{ trips: Trip[] }>('/trips/mine'),
        api<{ notifications: Notification[] }>('/notifications'),
      ]);
      setActivity(requests); setMyTrips(mine.trips); setNotifications(alerts.notifications);
    } catch (cause) { setError((cause as Error).message); }
  };
  useEffect(() => {
    api<{ user: User }>('/auth/me').then((result) => setUser(result.user)).catch(() => {});
    loadTrips(null);
  }, []);
  useEffect(() => { if (view === 'activity' && user) loadActivity(); }, [view, user?.id]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (search.from.trim().toLocaleLowerCase('es') === search.to.trim().toLocaleLowerCase('es')) {
      setError('Origen y destino deben ser diferentes.'); return;
    }
    setSearched(true); loadTrips(search);
    trackProductEvent('search_started');
    document.getElementById('nar-results')?.scrollIntoView({ behavior: 'smooth' });
  };
  const openRequest = (trip: Trip) => {
    if (!user) { setAuthOpen(true); setNotice('Inicia sesión para solicitar un asiento.'); return; }
    setRequestError('');
    setRequestDraft({ trip, pickupId: trip.match?.pickupStopId || trip.stops[0].id, dropoffId: trip.match?.dropoffStopId || trip.stops.at(-1)!.id, seats: 1 });
  };
  const submitRequest = async (event: FormEvent) => {
    event.preventDefault(); if (!requestDraft) return;
    setRequestError(''); setRequestBusy(true);
    try {
      await post(`/trips/${requestDraft.trip.id}/requests`, { pickupStopId: requestDraft.pickupId, dropoffStopId: requestDraft.dropoffId, seats: requestDraft.seats });
      trackProductEvent('seat_requested');
      setRequestDraft(null); setNotice('Solicitud enviada. El conductor debe aceptarla; tus asientos aún no están confirmados.');
      setView('activity'); await loadActivity();
    } catch (cause) { setRequestError((cause as Error).message); }
    finally { setRequestBusy(false); }
  };
  const actOnRequest = async (id: string, action: 'accept' | 'reject' | 'cancel') => {
    try { await post(`/requests/${id}/${action}`); if (action === 'accept') trackProductEvent('request_accepted'); setNotice(action === 'accept' ? 'Solicitud aceptada y capacidad actualizada.' : 'Solicitud actualizada.'); await loadActivity(); await loadTrips(); }
    catch (cause) { setError((cause as Error).message); }
  };
  const cancelTrip = async (id: string) => {
    try { await post(`/trips/${id}/cancel`); setNotice('Trayecto cancelado y solicitudes cerradas.'); await loadActivity(); await loadTrips(); }
    catch (cause) { setError((cause as Error).message); }
  };
  const readNotification = async (id: string) => {
    try { await post(`/notifications/${id}/read`); await loadActivity(); }
    catch (cause) { setError((cause as Error).message); }
  };
  const requestPickupPosition = requestDraft?.trip.stops.findIndex((stop) => stop.id === requestDraft.pickupId) ?? -1;

  return (
    <div className="marketplace">
      <header className="mp-header">
        <div className="mp-container mp-header-inner">
          <button className="mp-brand" type="button" onClick={() => setView('search')} title="Ir al inicio"><Brand /></button>
          <nav aria-label="Navegación principal" className="mp-nav">
            <button type="button" aria-current={view === 'search' ? 'page' : undefined} onClick={() => setView('search')}>Buscar viajes</button>
            <button type="button" aria-current={view === 'publish' ? 'page' : undefined} onClick={() => { trackProductEvent('publish_started'); setView('publish'); }}>Publicar trayecto</button>
            <button type="button" aria-current={view === 'activity' ? 'page' : undefined} onClick={() => setView('activity')}>Mis viajes</button>
          </nav>
          <div className="mp-account">
            {user ? <><span className="mp-username">{user.name}</span><button type="button" className="mp-text-button" onClick={async () => { await post('/auth/logout'); setUser(null); setView('search'); setNotice('Sesión cerrada.'); }}>Salir</button></> : <button type="button" className="mp-outline-button" onClick={() => setAuthOpen(true)}>Entrar</button>}
          </div>
        </div>
      </header>

      {view === 'search' && <main>
        <section className="mp-hero" aria-labelledby="mp-title">
          <div className="mp-container mp-hero-layout">
            <div className="mp-hero-copy">
              <h1 id="mp-title">Comparte un trayecto que ya vas a hacer.</h1>
              <p>Encuentra un asiento en rutas publicadas por personas que viajan por tu camino. Elige dónde subes y dónde bajas.</p>
              <button type="button" className="mp-quiet-link" onClick={() => { trackProductEvent('publish_started'); setView('publish'); }}>¿Conduces? Publica tu trayecto <ArrowRight size={17} aria-hidden="true" /></button>
            </div>
            <div className="mp-route-mark" aria-hidden="true"><span>Origen</span><i /><span>Parada compatible</span><i /><span>Destino</span></div>
          </div>
          <form className="mp-search mp-container" onSubmit={submitSearch}>
            <div className="mp-search-heading"><h2>Busca tu próximo trayecto</h2><p>Los resultados incluyen únicamente viajes publicados en esta beta local.</p></div>
            <div className="mp-search-grid">
              <label>Origen<input required list="nar-cities" value={search.from} onChange={(event) => setSearch({ ...search, from: event.target.value })} placeholder="Ciudad o parada de salida" /></label>
              <button type="button" className="mp-swap" aria-label="Intercambiar origen y destino" onClick={() => setSearch({ ...search, from: search.to, to: search.from })}><ArrowRightLeft size={20} /></button>
              <label>Destino<input required list="nar-cities" value={search.to} onChange={(event) => setSearch({ ...search, to: event.target.value })} placeholder="Ciudad o parada de llegada" /></label>
              <label>Fecha<input type="date" min={todayInSalvador()} value={search.date} onChange={(event) => setSearch({ ...search, date: event.target.value })} /></label>
              <label>Asientos<select value={search.seats} onChange={(event) => setSearch({ ...search, seats: Number(event.target.value) })}>{[1, 2, 3, 4, 5, 6, 7].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
              <button className="mp-primary-button" type="submit"><Search size={18} aria-hidden="true" /> Buscar</button>
            </div>
            <datalist id="nar-cities">{cities.map((city) => <option key={city} value={city} />)}</datalist>
          </form>
        </section>
        <section className="mp-results mp-container" id="nar-results" aria-labelledby="results-title">
          <div className="mp-section-heading"><div><h2 id="results-title">{searched ? 'Trayectos compatibles' : 'Próximos trayectos'}</h2><p>Las solicitudes quedan pendientes hasta que el conductor las acepte.</p></div>{searched && <button type="button" className="mp-text-button" onClick={() => { setSearched(false); setSearch({ from: '', to: '', date: '', seats: 1 }); loadTrips(null); }}>Ver todos</button>}</div>
          {loading && <p role="status" className="mp-state">Cargando trayectos…</p>}
          {!loading && trips.length === 0 && <div className="mp-state"><MapPin size={26} aria-hidden="true" /><h3>Por ahora no hay trayectos {searched ? 'para este tramo' : 'publicados'}.</h3><p>Prueba otra fecha o consulta de nuevo más tarde. Si conduces, puedes publicar el recorrido que ya tienes previsto.</p><button type="button" className="mp-outline-button" onClick={() => { trackProductEvent('publish_started'); setView('publish'); }}>Publicar trayecto</button></div>}
          {!loading && trips.length > 0 && <div className="mp-trip-list">{trips.map((trip) => <TripCard key={trip.id} trip={trip} onRequest={() => openRequest(trip)} isOwn={trip.driverId === user?.id} />)}</div>}
        </section>
        <section className="mp-how mp-container" aria-labelledby="mp-how-title"><h2 id="mp-how-title">Así funciona NAR</h2><div><p><strong>1. Encuentra.</strong> Busca un recorrido y revisa el orden de las paradas.</p><p><strong>2. Solicita.</strong> Indica tu tramo y el número de asientos que necesitas.</p><p><strong>3. Acuerda.</strong> El conductor acepta o rechaza la solicitud; solo la aceptación confirma los asientos.</p></div></section>
      </main>}

      {view === 'publish' && <main className="mp-container mp-inner-page"><h1>Publica un trayecto que ya realizarás.</h1><p>Indica tu ruta en orden. NAR no propondrá desvíos fuera de las paradas que confirmes.</p>{user ? <PublishForm onPublished={() => { trackProductEvent('trip_published'); setNotice('Trayecto publicado. Ya puede aparecer en las búsquedas compatibles.'); setView('search'); setSearched(false); loadTrips(null); }} /> : <div className="mp-state"><p>Necesitas una cuenta para publicar y gestionar solicitudes.</p><button className="mp-primary-button" type="button" onClick={() => setAuthOpen(true)}>Crear cuenta o entrar</button></div>}</main>}

      {view === 'activity' && <main className="mp-container mp-inner-page"><h1>Mis viajes y solicitudes</h1><p>Una solicitud pendiente no garantiza un asiento. Aquí puedes seguir su estado.</p>{user ? <div className="mp-activity-grid"><NotificationsPanel items={notifications} onRead={readNotification} /><section><h2>Solicitudes recibidas</h2>{activity.driver.length ? activity.driver.map((item) => <RequestItem key={item.id} request={item} label={item.passenger_name || 'Pasajero'} actions={item.status === 'pending' ? <><button onClick={() => actOnRequest(item.id, 'accept')}>Aceptar</button><button onClick={() => actOnRequest(item.id, 'reject')}>Rechazar</button></> : null} />) : <p className="mp-muted">Aún no tienes solicitudes como conductor.</p>}</section><section><h2>Mis solicitudes</h2>{activity.passenger.length ? activity.passenger.map((item) => <RequestItem key={item.id} request={item} label={`Conductor: ${item.driver_name}`} actions={['pending', 'accepted'].includes(item.status) ? <button onClick={() => actOnRequest(item.id, 'cancel')}>Cancelar</button> : null} />) : <p className="mp-muted">Aún no has solicitado asientos.</p>}</section><section className="mp-my-trips"><h2>Trayectos publicados</h2>{myTrips.length ? myTrips.map((trip) => <article key={trip.id} className="mp-activity-item"><strong>{trip.stops[0].city} → {trip.stops.at(-1)?.city}</strong><span>{dateLabel(trip.departureDate)} · {trip.departureTime} · {trip.availableSeats} de {trip.totalSeats} asientos libres</span><span>Estado: {trip.status === 'scheduled' ? 'programado' : trip.status === 'cancelled' ? 'cancelado' : 'finalizado'}</span>{trip.status === 'scheduled' && <button type="button" onClick={() => cancelTrip(trip.id)}>Cancelar trayecto</button>}</article>) : <p className="mp-muted">Aún no has publicado trayectos.</p>}</section></div> : <div className="mp-state"><p>Entra para consultar tus viajes y solicitudes.</p><button className="mp-primary-button" type="button" onClick={() => setAuthOpen(true)}>Entrar</button></div>}</main>}

      <footer className="mp-footer"><div className="mp-container"><Brand /><p>NAR · Viajes compartidos en El Salvador</p><span>Beta local · Sin pagos ni verificación de identidad</span><a href="/como-funciona/">Cómo funciona</a><a href="/demo">Explorar prototipo visual</a></div></footer>
      {notice && <div className="mp-toast" role="status"><Check size={18} aria-hidden="true" />{notice}<button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')}><X size={16} /></button></div>}
      {error && <div className="mp-error" role="alert">{error}<button type="button" onClick={() => setError('')}>Cerrar</button></div>}
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onSuccess={(nextUser) => { setUser(nextUser); setAuthOpen(false); setNotice(`Hola, ${nextUser.name}. Ya puedes participar en NAR.`); }} />}
      {requestDraft && <div className="mp-dialog-backdrop" role="presentation"><form className="mp-dialog" role="dialog" aria-modal="true" aria-labelledby="request-title" onSubmit={submitRequest}><button type="button" className="mp-close" aria-label="Cerrar" onClick={() => setRequestDraft(null)}><X size={20} /></button><h2 id="request-title">Solicitar asientos</h2><p>El conductor debe aceptar tu solicitud antes de que los asientos queden confirmados.</p><label>Subir en<select autoFocus value={requestDraft.pickupId} onChange={(event) => { const pickupId = event.target.value; const pickupIndex = requestDraft.trip.stops.findIndex((stop) => stop.id === pickupId); const dropoffIndex = requestDraft.trip.stops.findIndex((stop) => stop.id === requestDraft.dropoffId); setRequestDraft({ ...requestDraft, pickupId, dropoffId: dropoffIndex > pickupIndex ? requestDraft.dropoffId : requestDraft.trip.stops[pickupIndex + 1].id }); }}>{requestDraft.trip.stops.slice(0, -1).map((stop) => <option key={stop.id} value={stop.id}>{stop.city} · {stop.name}</option>)}</select></label><label>Bajar en<select value={requestDraft.dropoffId} onChange={(event) => setRequestDraft({ ...requestDraft, dropoffId: event.target.value })}>{requestDraft.trip.stops.slice(requestPickupPosition + 1).map((stop) => <option key={stop.id} value={stop.id}>{stop.city} · {stop.name}</option>)}</select></label><label>Asientos<select value={requestDraft.seats} onChange={(event) => setRequestDraft({ ...requestDraft, seats: Number(event.target.value) })}>{Array.from({ length: requestDraft.trip.availableSeats }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}</select></label>{requestError && <p role="alert" className="mp-form-error">{requestError}</p>}<button className="mp-primary-button" disabled={requestBusy} type="submit">{requestBusy ? 'Enviando…' : 'Enviar solicitud'}</button></form></div>}
    </div>
  );
}

function Brand() {
  return <span className="mp-brand-lockup"><img src="/logo.svg" alt="" width="38" height="38" /><span><strong>NAR <small>SV</small></strong><em>Viajes compartidos</em></span></span>;
}

function NotificationsPanel({ items, onRead }: { items: Notification[]; onRead: (id: string) => void }) {
  return <section className="mp-notifications" aria-labelledby="notifications-title"><h2 id="notifications-title">Avisos</h2>{items.length ? items.map((item) => <article key={item.id} className={`mp-notification ${item.read_at ? '' : 'mp-notification-new'}`}><p>{item.message}</p>{!item.read_at && <button type="button" onClick={() => onRead(item.id)}>Marcar como leído</button>}</article>) : <p className="mp-muted">Aún no tienes avisos.</p>}</section>;
}

function TripCard({ trip, onRequest, isOwn }: { trip: Trip; onRequest: () => void; isOwn: boolean }) {
  const first = trip.stops[0]; const last = trip.stops.at(-1)!;
  return <article className="mp-trip"><div className="mp-trip-time"><strong>{trip.departureTime}</strong><span>{dateLabel(trip.departureDate)}</span></div><div className="mp-trip-route"><div><i /><strong>{first.city}</strong><span>{first.name}</span></div>{trip.stops.slice(1, -1).map((stop) => <div className="mp-intermediate" key={stop.id}><i /><span>{stop.city}</span></div>)}<div><i /><strong>{last.city}</strong><span>{last.name}</span></div></div><div className="mp-trip-meta"><span><Users size={16} aria-hidden="true" />{trip.availableSeats} asientos</span><span><CarFront size={16} aria-hidden="true" />{trip.vehicleDescription}</span><span>Conduce {trip.driverName}</span>{trip.notes && <small>{trip.notes}</small>}</div><div className="mp-trip-action"><strong>{money(trip.contributionCents)}</strong><span>aporte por asiento</span><button className="mp-primary-button" type="button" disabled={isOwn || trip.availableSeats === 0} onClick={onRequest}>{isOwn ? 'Tu trayecto' : 'Solicitar asiento'}</button></div></article>;
}

function RequestItem({ request, label, actions }: { request: SeatRequest; label: string; actions: ReactNode }) {
  const status = { pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', cancelled: 'Cancelada' }[request.status];
  return <article className="mp-activity-item"><strong>{request.pickup_city} → {request.dropoff_city}</strong><span>{request.pickup_name} → {request.dropoff_name}</span><span>{label} · {dateLabel(request.departure_date)} · {request.departure_time} · {request.seats} {request.seats === 1 ? 'asiento' : 'asientos'}</span><span className={`mp-status mp-status-${request.status}`}>{status}</span>{actions && <div className="mp-activity-actions">{actions}</div>}</article>;
}

function AuthDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await post<{ user: User }>(`/auth/${mode}`, { ...(mode === 'register' ? { name } : {}), email, password }); onSuccess(result.user); }
    catch (cause) { setError((cause as Error).message); } finally { setBusy(false); }
  };
  return <div className="mp-dialog-backdrop" role="presentation"><form className="mp-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onSubmit={submit}><button className="mp-close" type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button><h2 id="auth-title">{mode === 'login' ? 'Entra a NAR' : 'Crea tu cuenta'}</h2><p>Una cuenta sirve para conducir y para viajar.</p>{mode === 'register' && <label>Tu nombre<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} /></label>}<label>Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Contraseña<input required type="password" minLength={12} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p role="alert" className="mp-form-error">{error}</p>}<button type="submit" className="mp-primary-button" disabled={busy}>{busy ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button><button type="button" className="mp-text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Crear una cuenta' : 'Ya tengo cuenta'}</button></form></div>;
}

function PublishForm({ onPublished }: { onPublished: (trip: Trip) => void }) {
  const [origin, setOrigin] = useState({ city: '', name: '' });
  const [destination, setDestination] = useState({ city: '', name: '' });
  const [stops, setStops] = useState<{ city: string; name: string }[]>([]);
  const [date, setDate] = useState(''); const [time, setTime] = useState(''); const [seats, setSeats] = useState(1);
  const [contribution, setContribution] = useState(''); const [vehicle, setVehicle] = useState(''); const [notes, setNotes] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await post<{ trip: Trip }>('/trips', { origin, destination, stops, date, time, seats, contributionCents: Math.round(Number(contribution) * 100), vehicleDescription: vehicle, notes });
      onPublished(result.trip);
    } catch (cause) { setError((cause as Error).message); } finally { setBusy(false); }
  };
  return <form className="mp-publish-form" onSubmit={submit}><fieldset><legend>Recorrido</legend><div className="mp-two-col"><label>Ciudad de salida<input required list="nar-publish-cities" value={origin.city} onChange={(event) => setOrigin({ ...origin, city: event.target.value })} /></label><label>Punto de encuentro<input required value={origin.name} onChange={(event) => setOrigin({ ...origin, name: event.target.value })} placeholder="Ej. entrada de Multiplaza" /></label></div>{stops.map((stop, index) => <div className="mp-stop-row" key={index}><label>Ciudad de la parada<input required list="nar-publish-cities" value={stop.city} onChange={(event) => setStops(stops.map((item, at) => at === index ? { ...item, city: event.target.value } : item))} /></label><label>Punto de la parada<input required value={stop.name} onChange={(event) => setStops(stops.map((item, at) => at === index ? { ...item, name: event.target.value } : item))} /></label><button type="button" aria-label={`Quitar parada ${index + 1}`} onClick={() => setStops(stops.filter((_, at) => at !== index))}><X size={18} /></button></div>)}<button type="button" className="mp-text-button" disabled={stops.length >= 8} onClick={() => setStops([...stops, { city: '', name: '' }])}><Plus size={16} /> Añadir parada intermedia</button><div className="mp-two-col"><label>Ciudad de llegada<input required list="nar-publish-cities" value={destination.city} onChange={(event) => setDestination({ ...destination, city: event.target.value })} /></label><label>Punto de llegada<input required value={destination.name} onChange={(event) => setDestination({ ...destination, name: event.target.value })} /></label></div><datalist id="nar-publish-cities">{cities.map((city) => <option key={city} value={city} />)}</datalist></fieldset><fieldset><legend>Salida y plazas</legend><div className="mp-two-col"><label>Fecha<input required type="date" min={todayInSalvador()} value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Hora en El Salvador<input required type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label>Asientos disponibles<select value={seats} onChange={(event) => setSeats(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6, 7].map((count) => <option key={count} value={count}>{count}</option>)}</select></label><label>Aporte por asiento (USD)<input required type="number" min="0" max="1000" step="0.01" inputMode="decimal" value={contribution} onChange={(event) => setContribution(event.target.value)} /></label></div></fieldset><fieldset><legend>Información para viajeros</legend><label>Vehículo<input required minLength={3} maxLength={120} value={vehicle} onChange={(event) => setVehicle(event.target.value)} placeholder="Ej. sedán gris con espacio para mochila" /></label><label>Notas opcionales<textarea maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Información útil sobre el punto de encuentro o el equipaje" /></label></fieldset>{error && <p className="mp-form-error" role="alert">{error}</p>}<button className="mp-primary-button" disabled={busy} type="submit">{busy ? 'Publicando…' : 'Publicar trayecto'}</button><p className="mp-muted">La ruta solo incluye las paradas que indiques. No se comprueba la geometría de carretera ni se cobra el aporte en NAR.</p></form>;
}
