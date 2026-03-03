// hooks/usePrayerTimes.ts
import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';

/**
 * opsi format lokasi:
 * - "city_country" => "Bogor, Indonesia" (default)
 * - "city" => "Bogor"
 * - "country" => "Indonesia"
 */
export type LocationFormat = 'city_country' | 'city' | 'country';

export interface UsePrayerTimesOptions {
  locationFormat?: LocationFormat;
  // optional manual fallback coords (lat, lng) if you want to show something when location denied
  fallbackCoords?: { latitude: number; longitude: number } | null;
  // whether to force 24h formatting for returned hour/minute
  force24h?: boolean;
}

export interface UsePrayerTimesResult {
  isLoading: boolean;
  error?: string | null;

  // next prayer name, empty string if unavailable
  nextPrayer: string;
  // remaining countdown string "HH:MM:SS" (00:05:12) or empty if unavailable
  remaining: string;

  // display location according to locationFormat or placeholder
  locationDisplay: string;
  // full date string like "02 June 2025"
  dateString: string;

  // current hour/minute as two-digit strings (based on device timezone; optional force24h)
  hour: string;
  minute: string;
  formattedTime: string; // "HH:MM"

  // raw prayerTimes object (adhan PrayerTimes) if you need advanced usage
  prayerTimesInstance: PrayerTimes | null;
}

/** ---------- helpers ---------- **/

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

/**
 * Normalize location returned by Expo reverse geocode.
 * - prefer `place.city`
 * - fallback to `place.region`
 * - remove Indonesian prefixes
 * - shrink "Bogor Barat" => "Bogor" (Indonesia-only rule to keep UI short)
 */
function normalizeCityForDisplay(place: Location.LocationGeocodedAddress | null): {
  city: string;
  country: string;
} {
  if (!place) return { city: '', country: '' };

  let city = place.city ?? place.region ?? '';
  const country = place.country ?? '';

  city = city
    .replace(/^Kecamatan\s+/i, '')
    .replace(/^Kabupaten\s+/i, '')
    .replace(/^Kota\s+/i, '')
    .trim();

  // Indonesia-specific shortener: "Bogor Barat" -> "Bogor"
  if (country === 'Indonesia' && city) {
    const words = city.split(' ').filter(Boolean);
    const directional = ['Barat', 'Timur', 'Utara', 'Selatan', 'Tengah'];
    if (words.length === 2 && directional.includes(words[1])) {
      city = words[0];
    }
  }

  return { city, country };
}

function buildLocationDisplay(
  place: Location.LocationGeocodedAddress | null,
  format: LocationFormat,
  placeholder = '—'
) {
  const { city, country } = normalizeCityForDisplay(place);

  if (!city && !country) return placeholder;

  switch (format) {
    case 'city':
      return city || country || placeholder;
    case 'country':
      return country || city || placeholder;
    case 'city_country':
    default:
      if (city && country) return `${city}, ${country}`;
      return city || country || placeholder;
  }
}

/** ---------- hook ---------- **/

export function usePrayerTimes(opts: UsePrayerTimesOptions = {}): UsePrayerTimesResult {
  const { locationFormat = 'city_country', fallbackCoords = null, force24h = true } = opts;

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [place, setPlace] = useState<Location.LocationGeocodedAddress | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [prayerTimesInstance, setPrayerTimesInstance] = useState<PrayerTimes | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // realtime clock (tick every second)
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // request location & reverse geocode ONCE (or use fallbackCoords)
  useEffect(() => {
    let mounted = true;

    async function initLocation() {
      setIsLoading(true);
      try {
        if (fallbackCoords) {
          // if user provided fallback coords, use them immediately (no permission)
          const { latitude, longitude } = fallbackCoords;
          if (mounted) {
            setCoords(new Coordinates(latitude, longitude));
            setPlace(null); // no reverse geocode available
          }
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setError('Location permission not granted');
            setIsLoading(false);
            return;
          }

          const location = await Location.getCurrentPositionAsync({});
          const rev = await Location.reverseGeocodeAsync(location.coords);

          if (mounted) {
            setCoords(new Coordinates(location.coords.latitude, location.coords.longitude));
            setPlace(rev.length > 0 ? rev[0] : null);
          }
        }
      } catch (err: any) {
        console.warn('usePrayerTimes: location error', err);
        setError(String(err?.message ?? err));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initLocation();

    return () => {
      mounted = false;
    };
  }, [fallbackCoords]);

  // calculate prayer times whenever coords available or date changes (recalc at midnight)
  useEffect(() => {
    if (!coords) {
      setPrayerTimesInstance(null);
      return;
    }

    try {
      // Create params
      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Shafi;

      // Use only the date part of currentTime (so next day recalculation triggers when date changes)
      const baseDate = new Date(
        currentTime.getFullYear(),
        currentTime.getMonth(),
        currentTime.getDate()
      );

      const pt = new PrayerTimes(coords, baseDate, params);
      setPrayerTimesInstance(pt);
    } catch (err: any) {
      console.warn('usePrayerTimes: prayer calc error', err);
      setError(String(err?.message ?? err));
      setPrayerTimesInstance(null);
    }
    // purposely re-run when coords change or day changes
  }, [coords, currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate()]);

  // derived values
  const locationDisplay = buildLocationDisplay(place, locationFormat, 'Loading...');

  const dateString = useMemo(() => {
    return currentTime.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }, [currentTime]);

  // hour/minute formatted two-digit; honoring force24h
  const { hour, minute, formattedTime } = useMemo(() => {
    // force 24h by using en-GB locale if requested
    const hourStr = force24h
      ? currentTime.toLocaleString('en-GB', { hour: '2-digit', hour12: false })
      : currentTime.toLocaleString(undefined, { hour: '2-digit' });

    const minuteStr = currentTime.toLocaleString(undefined, { minute: '2-digit' });

    return {
      hour: hourStr,
      minute: minuteStr,
      formattedTime: `${hourStr}:${minuteStr}`,
    };
  }, [currentTime, force24h]);

  // compute next prayer and remaining string
  const { nextPrayer, remaining } = useMemo(() => {
    if (!prayerTimesInstance) return { nextPrayer: '', remaining: '' };

    try {
      const next = prayerTimesInstance.nextPrayer();
      const nextTime = prayerTimesInstance.timeForPrayer(next);
      if (!nextTime) return { nextPrayer: next ?? '', remaining: '' };

      const diff = nextTime.getTime() - currentTime.getTime();
      if (diff <= 0) {
        // if negative, return 00:00:00
        return { nextPrayer: next ?? '', remaining: `00:00:00` };
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      return {
        nextPrayer: (next ?? '').toString(),
        remaining: `${pad(h)}:${pad(m)}:${pad(s)}`,
      };
    } catch (err) {
      console.warn('usePrayerTimes: next prayer calc failed', err);
      return { nextPrayer: '', remaining: '' };
    }
  }, [prayerTimesInstance, currentTime]);

  return {
    isLoading,
    error,
    nextPrayer,
    remaining,
    locationDisplay,
    dateString,
    hour,
    minute,
    formattedTime,
    prayerTimesInstance,
  };
}
