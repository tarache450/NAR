export interface User { id: string; name: string; email: string }
export interface Stop { id: string; position: number; name: string; city: string; plannedTime: string | null }
export interface Trip {
  id: string; driverId: string; driverName: string; departureDate: string; departureTime: string;
  totalSeats: number; availableSeats: number; contributionCents: number; vehicleDescription: string;
  notes: string; status: 'scheduled' | 'cancelled' | 'completed'; stops: Stop[];
  match?: { pickupStopId: string; dropoffStopId: string; pickupPosition: number; dropoffPosition: number };
}
export interface SeatRequest {
  id: string; trip_id: string; passenger_id: string; pickup_stop_id: string; dropoff_stop_id: string;
  seats: number; status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  departure_date: string; departure_time: string; driver_name?: string; passenger_name?: string;
  pickup_city: string; pickup_name: string; dropoff_city: string; dropoff_name: string;
}
export interface Notification {
  id: string; event_type: string; entity_id: string; message: string;
  read_at: string | null; created_at: string;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error || 'No pudimos completar la operación. Inténtalo de nuevo.');
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const post = <T>(path: string, body?: unknown) => api<T>(path, { method: 'POST', ...(body ? { body: JSON.stringify(body) } : {}) });
