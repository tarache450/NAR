-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PROFILES (Perfiles de usuario conectados a Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  dui TEXT, -- Documento Único de Identidad (El Salvador: 00000000-0)
  role TEXT NOT NULL CHECK (role IN ('passenger', 'driver')) DEFAULT 'passenger',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  dui_verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  total_trips INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA: VEHICLES (Vehículos registrados por conductores)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  plate TEXT NOT NULL UNIQUE, -- Placa salvadoreña (ej: P 123-456)
  color TEXT NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats BETWEEN 1 AND 8) DEFAULT 4,
  photo_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA: RIDES (Viajes interurbanos de Carpooling / Movilidad)
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  origin_city TEXT NOT NULL,
  origin_address TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  intermediate_stop TEXT,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  estimated_duration TEXT NOT NULL DEFAULT '1h 15m',
  distance_km NUMERIC(6, 2) NOT NULL DEFAULT 64.0,
  total_seats INT NOT NULL CHECK (total_seats > 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  price_per_seat NUMERIC(6, 2) NOT NULL CHECK (price_per_seat >= 0),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'boarding', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_available_seats_limit CHECK (available_seats <= total_seats)
);

-- 5. TABLA: BOOKINGS (Reservas de pasajeros)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reserved_seats INT NOT NULL CHECK (reserved_seats > 0) DEFAULT 1,
  total_price NUMERIC(8, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'boarded', 'cancelled')) DEFAULT 'confirmed',
  qr_code_token TEXT NOT NULL UNIQUE,
  seat_number INT NOT NULL DEFAULT 1,
  boarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLA: RIDE_MESSAGES (Chat en tiempo real por viaje)
CREATE TABLE IF NOT EXISTS public.ride_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TRIGGER AUTOMÁTICO: Crear perfil al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'passenger'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_messages ENABLE ROW LEVEL SECURITY;

-- 9. POLÍTICAS DE SEGURIDAD (RLS)
-- Profiles: Lectura pública, actualización solo por el propietario
DROP POLICY IF EXISTS "Perfiles públicos" ON public.profiles;
CREATE POLICY "Perfiles públicos" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios editan su perfil" ON public.profiles;
CREATE POLICY "Usuarios editan su perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles: Lectura pública, conductores gestionan sus autos
DROP POLICY IF EXISTS "Vehiculos visibles para todos" ON public.vehicles;
CREATE POLICY "Vehiculos visibles para todos" ON public.vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Conductores administran sus vehiculos" ON public.vehicles;
CREATE POLICY "Conductores administran sus vehiculos" ON public.vehicles FOR ALL USING (auth.uid() = driver_id);

-- Rides: Cualquier usuario puede buscar y ver viajes activos
DROP POLICY IF EXISTS "Viajes visibles para todos" ON public.rides;
CREATE POLICY "Viajes visibles para todos" ON public.rides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Conductores publican viajes" ON public.rides;
CREATE POLICY "Conductores publican viajes" ON public.rides FOR INSERT WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Conductores actualizan sus viajes" ON public.rides;
CREATE POLICY "Conductores actualizan sus viajes" ON public.rides FOR UPDATE USING (auth.uid() = driver_id);

-- Bookings: Pasajeros ven sus reservas y conductores ven las reservas de sus viajes
DROP POLICY IF EXISTS "Ver reservas propias o de viaje a cargo" ON public.bookings;
CREATE POLICY "Ver reservas propias o de viaje a cargo" ON public.bookings FOR SELECT USING (
  auth.uid() = passenger_id OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
);

DROP POLICY IF EXISTS "Pasajeros crean reservas" ON public.bookings;
CREATE POLICY "Pasajeros crean reservas" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);

DROP POLICY IF EXISTS "Conductor o pasajero cancelan/actualizan reserva" ON public.bookings;
CREATE POLICY "Conductor o pasajero cancelan/actualizan reserva" ON public.bookings FOR UPDATE USING (
  auth.uid() = passenger_id OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
);

-- Ride Messages: Chat accesible para conductor y pasajeros con reserva
DROP POLICY IF EXISTS "Participantes del viaje leen mensajes" ON public.ride_messages;
CREATE POLICY "Participantes del viaje leen mensajes" ON public.ride_messages FOR SELECT USING (
  auth.uid() = sender_id 
  OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  OR auth.uid() IN (SELECT passenger_id FROM public.bookings WHERE ride_id = ride_messages.ride_id)
);

DROP POLICY IF EXISTS "Participantes envían mensajes" ON public.ride_messages;
CREATE POLICY "Participantes envían mensajes" ON public.ride_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- 10. ACTIVAR TIEMPO REAL (REALTIME)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
  EXCEPTION WHEN duplicate_object THEN
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  EXCEPTION WHEN duplicate_object THEN
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_messages;
  EXCEPTION WHEN duplicate_object THEN
  END;
END $$;
