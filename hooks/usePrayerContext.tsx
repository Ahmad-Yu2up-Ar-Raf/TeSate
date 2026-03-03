// context/PrayerContext.tsx

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';

/* ================= TYPES ================= */

export interface PrayerBootstrapData {
  coordinates: Coordinates;
  city: string;
}

export interface PrayerContextValue {
  nextPrayer: string;
  remaining: string;
  city: string;
  dateString: string;
  hour: string;
  minute: string;
}

/* ================= CONTEXT ================= */

const PrayerContext = createContext<PrayerContextValue | null>(null);

/* ================= HELPERS ================= */

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * Normalize city with directional support
 * Example:
 * - Bogor Barat
 * - Bekasi Timur
 * - Jakarta Selatan
 */
function normalizeCity(place: Location.LocationGeocodedAddress | null): string {
  if (!place) return 'Indonesia';

  const clean = (value: string | null | undefined): string =>
    (value ?? '')
      .replace(/^Kecamatan\s+/i, '')
      .replace(/^Kabupaten\s+/i, '')
      .replace(/^Kota\s+/i, '')
      .trim();

  const city = clean(place.city);
  const district = clean(place.district);
  const subregion = clean(place.subregion);
  const region = clean(place.region);

  // 🔥 PRIORITY ORDER (Indonesia optimized):
  // 1. district (Bogor Barat)
  // 2. city (Bogor)
  // 3. subregion
  // 4. region

  if (district) return district;
  if (city) return city;
  if (subregion) return subregion;
  if (region) return region;

  return 'Indonesia';
}

/* ================= BOOTSTRAP ================= */

export async function initializePrayerData(): Promise<PrayerBootstrapData> {
  // default fallback (Bogor)
  let latitude = -6.595;
  let longitude = 106.806;
  let city = 'Bogor';

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      const position = await Location.getCurrentPositionAsync({});

      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      const reverse = await Location.reverseGeocodeAsync(position.coords);

      if (reverse.length > 0) {
        city = normalizeCity(reverse[0]);
      }
    }
  } catch (error) {
    console.warn('Location fallback used');
  }

  return {
    coordinates: new Coordinates(latitude, longitude),
    city,
  };
}

/* ================= PROVIDER ================= */

interface PrayerProviderProps {
  children: React.ReactNode;
  initialData: PrayerBootstrapData;
}

export function PrayerProvider({ children, initialData }: PrayerProviderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Single global clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Recalculate only when date changes
  const prayerTimes = useMemo(() => {
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi;

    const baseDate = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate()
    );

    return new PrayerTimes(initialData.coordinates, baseDate, params);
  }, [
    initialData.coordinates,
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
  ]);

  const { nextPrayer, remaining } = useMemo(() => {
    const next = prayerTimes.nextPrayer();
    const nextTime = prayerTimes.timeForPrayer(next);

    if (!nextTime) {
      return {
        nextPrayer: '',
        remaining: '00:00:00',
      };
    }

    const diff = nextTime.getTime() - currentTime.getTime();

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return {
      nextPrayer: next ?? '',
      remaining: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    };
  }, [prayerTimes, currentTime]);

  const value: PrayerContextValue = {
    nextPrayer,
    remaining,
    city: initialData.city,
    dateString: currentTime.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    hour: pad(currentTime.getHours()),
    minute: pad(currentTime.getMinutes()),
  };

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

/* ================= HOOK ================= */

export function usePrayer(): PrayerContextValue {
  const context = useContext(PrayerContext);

  if (!context) {
    throw new Error('usePrayer must be used inside PrayerProvider');
  }

  return context;
}
