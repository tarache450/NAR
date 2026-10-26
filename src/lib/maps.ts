import type { Ride, Waypoint } from '../types';

function mapsPlace(point: Waypoint) {
  return Number.isFinite(point.lat) && Number.isFinite(point.lng)
    ? `${point.lat},${point.lng}`
    : [point.name, point.city, 'El Salvador'].filter(Boolean).join(', ');
}

export function googleMapsDirectionsUrl(ride: Ride) {
  const params = new URLSearchParams({
    api: '1',
    origin: mapsPlace(ride.origin),
    destination: mapsPlace(ride.destination),
    travelmode: 'driving',
  });
  if (ride.waypoints.length) {
    params.set('waypoints', ride.waypoints.map(mapsPlace).join('|'));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
