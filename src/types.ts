export interface Waypoint {
  id: string;
  name: string;
  city: string;
  time: string;
  type: 'origin' | 'stop' | 'destination';
  address: string;
  lat?: number;
  lng?: number;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Driver {
  id: string;
  name: string;
  role: string;
  affiliation: string; // e.g. "UCA / Banco Agrícola", "Tigo El Salvador", "Hospital El Salvador"
  avatar: string;
  rating: number;
  totalTrips: number;
  verifiedDUI: boolean;
  verifiedPhone: boolean;
  phone: string;
  memberSince: string;
  bio?: string;
  reviews?: Review[];
}

export interface Vehicle {
  make: string;
  model: string;
  year: number;
  type: string;
  plate: string;
  color: string;
  image: string;
  features: string[];
}

export interface Passenger {
  id: string;
  name: string;
  affiliation?: string;
  avatar: string;
  seatNumber: number;
  pickupPoint: string;
  status?: 'confirmed' | 'picked_up';
}

export interface Ride {
  id: string;
  driver: Driver;
  vehicle: Vehicle;
  origin: Waypoint;
  waypoints: Waypoint[];
  destination: Waypoint;
  date: string;
  departureTime: string;
  arrivalTime: string;
  estimatedDuration: string;
  distanceKm: number;
  totalSeats: number;
  availableSeats: number;
  seatPrice: number; // in USD ($)
  gasContributionTotal: number;
  status: 'scheduled' | 'boarding' | 'in_progress' | 'completed';
  amenities: string[];
  notes?: string;
  passengers: Passenger[];
  isRecurring?: boolean;
  recurringDays?: string;
}

export interface RoutePopular {
  id: string;
  origin: string;
  destination: string;
  intermediate: string;
  avgPrice: number;
  activeRidesCount: number;
  image: string;
  travelTime: string;
}
