import { supabase } from './supabase';
import type { Ride, Booking, Driver, Vehicle, Waypoint, Passenger } from '../types';

export interface PublishRidePayload {
  originCity: string;
  originSpot: string;
  stopCity?: string;
  stopSpot?: string;
  destCity: string;
  destSpot: string;
  departure: string; // "07:00"
  arrival: string;   // "08:15"
  seats: number;
  price: number;
  carBrand: string;
  carModel: string;
  plate: string;
  color: string;
  recurring: boolean;
  recurringDays?: string;
  notes?: string;
  hasAC?: boolean;
}

// Mapea un registro de Supabase (con joins) al tipo `Ride` que consume la UI
export function mapSupabaseRideToRide(row: any): Ride {
  const driverProfile = row.driver || {};
  const vehicleData = row.vehicle || {};

  const driver: Driver = {
    id: driverProfile.id || row.driver_id,
    name: driverProfile.full_name || 'Conductor NAR',
    role: driverProfile.role === 'driver' ? 'Conductor Verificado' : 'Miembro NAR',
    affiliation: 'Conductor Verificado NAR',
    avatar: driverProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    rating: Number(driverProfile.rating || 5.0),
    totalTrips: Number(driverProfile.total_trips || 1),
    verifiedDUI: Boolean(driverProfile.dui_verified),
    verifiedPhone: Boolean(driverProfile.phone),
    phone: driverProfile.phone || '+503 7000-0000',
    memberSince: new Date(driverProfile.created_at || Date.now()).toLocaleDateString('es-SV', {
      month: 'short',
      year: 'numeric',
    }),
  };

  const vehicle: Vehicle = {
    make: vehicleData.brand || 'Vehículo',
    model: vehicleData.model || '',
    year: vehicleData.year || 2022,
    type: 'Sedán',
    plate: vehicleData.plate || 'P 000-000',
    color: vehicleData.color || 'Gris',
    image: vehicleData.photo_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    features: ['Aire acondicionado', 'Asientos cómodos'],
  };

  const depDate = new Date(row.departure_time);
  const arrDate = new Date(row.arrival_time);
  const depTimeStr = !isNaN(depDate.getTime())
    ? depDate.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '07:00 AM';
  const arrTimeStr = !isNaN(arrDate.getTime())
    ? arrDate.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '08:15 AM';

  const origin: Waypoint = {
    id: `wp-orig-${row.id}`,
    city: row.origin_city,
    name: row.origin_address,
    address: `${row.origin_address}, ${row.origin_city}`,
    type: 'origin',
    time: depTimeStr,
  };

  const destination: Waypoint = {
    id: `wp-dest-${row.id}`,
    city: row.destination_city,
    name: row.destination_address,
    address: `${row.destination_address}, ${row.destination_city}`,
    type: 'destination',
    time: arrTimeStr,
  };

  const waypoints: Waypoint[] = row.intermediate_stop
    ? [
        {
          id: `wp-stop-${row.id}`,
          city: row.intermediate_stop.split(',')[1]?.trim() || row.origin_city,
          name: row.intermediate_stop.split(',')[0]?.trim() || row.intermediate_stop,
          address: row.intermediate_stop,
          type: 'stop',
          time: 'En ruta',
        },
      ]
    : [];

  const passengers: Passenger[] = (row.bookings || []).map((b: any, index: number) => ({
    id: b.id,
    name: b.passenger?.full_name || `Pasajero ${index + 1}`,
    avatar: b.passenger?.avatar_url || '',
    seatNumber: b.seat_number || index + 1,
    pickupPoint: origin.name,
    status: b.status === 'boarded' ? 'picked_up' : 'confirmed',
  }));

  return {
    id: row.id,
    driver,
    vehicle,
    origin,
    waypoints,
    destination,
    date: depDate.toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric', month: 'short' }),
    departureTime: depTimeStr,
    arrivalTime: arrTimeStr,
    estimatedDuration: row.estimated_duration || '1h 15m',
    distanceKm: Number(row.distance_km || 64),
    totalSeats: Number(row.total_seats || 4),
    availableSeats: Number(row.available_seats ?? row.total_seats ?? 4),
    seatPrice: Number(row.price_per_seat || 3.0),
    gasContributionTotal: Number((Number(row.price_per_seat || 3) * Number(row.total_seats || 4)).toFixed(2)),
    status: row.status || 'scheduled',
    amenities: ['Aire acondicionado', 'Maletero espacioso'],
    notes: row.notes || undefined,
    passengers,
    isRecurring: Boolean(row.is_recurring),
    recurringDays: row.is_recurring ? 'Lunes a Viernes' : undefined,
  };
}

// 1. Obtener todos los viajes disponibles en tiempo real
export async function getLiveRides(): Promise<Ride[]> {
  try {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:profiles(*),
        vehicle:vehicles(*),
        bookings(*, passenger:profiles(*))
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ridesApi] Error al obtener viajes:', error);
      return [];
    }

    return (data || []).map(mapSupabaseRideToRide);
  } catch (err) {
    console.error('[ridesApi] Error de red:', err);
    return [];
  }
}

// 2. Publicar un nuevo viaje en Supabase
export async function publishLiveRide(payload: PublishRidePayload, userId: string): Promise<{ success: boolean; ride?: Ride; error?: string }> {
  try {
    // 1. Verificar o crear el vehículo del conductor si tiene placas
    let vehicleId: string | null = null;
    if (payload.plate) {
      const { data: existingVehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('plate', payload.plate.trim().toUpperCase())
        .limit(1);

      if (existingVehicles && existingVehicles.length > 0) {
        vehicleId = existingVehicles[0].id;
      } else {
        const { data: newVehicle, error: vehicleErr } = await supabase
          .from('vehicles')
          .insert({
            driver_id: userId,
            brand: payload.carBrand || 'Vehículo',
            model: payload.carModel || 'Sedán',
            year: new Date().getFullYear(),
            plate: payload.plate.trim().toUpperCase(),
            color: payload.color || 'Gris',
            total_seats: payload.seats || 4,
          })
          .select('id')
          .single();

        if (!vehicleErr && newVehicle) {
          vehicleId = newVehicle.id;
        }
      }
    }

    // Calcular fechas estimadas
    const today = new Date();
    const [depH, depM] = payload.departure.split(':').map(Number);
    const [arrH, arrM] = payload.arrival.split(':').map(Number);

    const depDate = new Date(today);
    depDate.setHours(depH, depM, 0, 0);

    const arrDate = new Date(today);
    arrDate.setHours(arrH, arrM, 0, 0);
    if (arrDate <= depDate) {
      arrDate.setDate(arrDate.getDate() + 1);
    }

    const durationMinutes = Math.max(15, Math.round((arrDate.getTime() - depDate.getTime()) / 60000));
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const stopStr = payload.stopSpot && payload.stopCity
      ? `${payload.stopSpot}, ${payload.stopCity}`
      : null;

    // Insertar en la tabla public.rides
    const { data: createdRide, error: rideErr } = await supabase
      .from('rides')
      .insert({
        driver_id: userId,
        vehicle_id: vehicleId,
        origin_city: payload.originCity,
        origin_address: payload.originSpot,
        destination_city: payload.destCity,
        destination_address: payload.destSpot,
        intermediate_stop: stopStr,
        departure_time: depDate.toISOString(),
        arrival_time: arrDate.toISOString(),
        estimated_duration: durationStr,
        distance_km: 64.0, // base promedio
        total_seats: payload.seats,
        available_seats: payload.seats,
        price_per_seat: payload.price,
        status: 'scheduled',
        notes: payload.notes || null,
        is_recurring: payload.recurring,
      })
      .select(`
        *,
        driver:profiles(*),
        vehicle:vehicles(*),
        bookings(*, passenger:profiles(*))
      `)
      .single();

    if (rideErr || !createdRide) {
      return { success: false, error: rideErr?.message || 'No se pudo publicar el viaje' };
    }

    return { success: true, ride: mapSupabaseRideToRide(createdRide) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inesperado al publicar' };
  }
}

// 3. Crear una reserva real en Supabase
export async function bookLiveRide(
  rideId: string,
  seats: number,
  pickupPoint: string,
  userId: string,
  passengerName: string,
  pricePerSeat: number
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    const totalPrice = Number((pricePerSeat * seats).toFixed(2));
    const token = `NAR-${Date.now().toString(36).slice(-5).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Insertar la reserva
    const { data: newBooking, error: bookErr } = await supabase
      .from('bookings')
      .insert({
        ride_id: rideId,
        passenger_id: userId,
        reserved_seats: seats,
        total_price: totalPrice,
        qr_code_token: token,
        status: 'confirmed',
      })
      .select('*, ride:rides(*, driver:profiles(*), vehicle:vehicles(*))')
      .single();

    if (bookErr || !newBooking) {
      return { success: false, error: bookErr?.message || 'Error al reservar' };
    }

    // 2. Decrementar asientos disponibles en el viaje
    const { data: currentRide } = await supabase
      .from('rides')
      .select('available_seats')
      .eq('id', rideId)
      .single();

    if (currentRide) {
      const remaining = Math.max(0, currentRide.available_seats - seats);
      await supabase
        .from('rides')
        .update({ available_seats: remaining })
        .eq('id', rideId);
    }

    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const bookingResult: Booking = {
      id: newBooking.qr_code_token,
      ride: mapSupabaseRideToRide(newBooking.ride),
      seatsBooked: seats,
      totalPrice,
      pickupPoint,
      passengerName,
      securityPin: `${pin.slice(0, 2)}-${pin.slice(2)}`,
      createdAt: Date.now(),
    };

    return { success: true, booking: bookingResult };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al procesar reserva' };
  }
}
