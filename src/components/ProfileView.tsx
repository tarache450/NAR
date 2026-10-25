import { ArrowRight, Car, MapPin, Route, ShieldCheck, Star } from 'lucide-react';
import { INITIAL_RIDES } from '../data/mockData';

interface ProfileViewProps {
  onOpenPublish: () => void;
  onExploreRides: () => void;
}

export function ProfileView({ onOpenPublish, onExploreRides }: ProfileViewProps) {
  const sampleRide = INITIAL_RIDES[0];
  const driver = sampleRide.driver;

  return (
    <div className="nar-view-shell nar-profile">
      <header className="nar-view-header">
        <p className="nar-eyebrow">PERSONAS DETRÁS DE CADA RUTA</p>
        <h1>Comparte el camino con más contexto.</h1>
        <p>Así se mostraría un perfil dentro de NAR. Los datos de esta pantalla son ejemplos y no representan una cuenta autenticada.</p>
      </header>

      <section className="nar-profile-card" aria-labelledby="nar-profile-name">
        <div className="nar-profile-photo" aria-hidden="true" />
        <div className="nar-profile-content">
          <div className="nar-profile-identity">
            <img src={driver.avatar} alt={`Retrato de ${driver.name}, perfil de ejemplo`} className="nar-profile-avatar" width="110" height="110" loading="lazy" decoding="async" />
            <div>
              <span className="nar-profile-label">PERFIL DE EJEMPLO</span>
              <h2 id="nar-profile-name">{driver.name}</h2>
              <p>Conductor en una ruta de demostración</p>
            </div>
          </div>
          <div className="nar-profile-facts">
            <div><MapPin size={19} aria-hidden="true" /><span>Ruta de ejemplo</span><strong>{sampleRide.origin.city} → {sampleRide.destination.city}</strong></div>
            <div><Car size={19} aria-hidden="true" /><span>Vehículo publicado</span><strong>{sampleRide.vehicle.make} {sampleRide.vehicle.model}</strong></div>
            <div><Star size={19} aria-hidden="true" /><span>Valoración de ejemplo</span><strong>{driver.rating.toFixed(1)} / 5</strong></div>
          </div>
        </div>
      </section>

      <section className="nar-profile-info" aria-labelledby="nar-profile-info-title">
        <div className="nar-profile-info-icon"><ShieldCheck size={26} aria-hidden="true" /></div>
        <div>
          <p className="nar-eyebrow">ESTADO DEL PROTOTIPO</p>
          <h2 id="nar-profile-info-title">Información clara para decidir.</h2>
          <p>Los perfiles ayudan a conocer los detalles de cada trayecto. La verificación de identidad, el historial de viajes y las reseñas reales todavía no están conectados en esta demo.</p>
        </div>
      </section>

      <div className="nar-profile-actions">
        <button type="button" className="nar-button nar-button-primary" onClick={onOpenPublish}>Publicar una ruta <ArrowRight size={18} aria-hidden="true" /></button>
        <button type="button" className="nar-button nar-button-quiet" onClick={onExploreRides}><Route size={18} aria-hidden="true" /> Explorar viajes</button>
      </div>
    </div>
  );
}
