// lib/server/surah/surah-server.ts
import type { SurahResponse, Datum } from '@/type/surah-type';
import type { SurahDetailResponse, Data } from '@/type/surah-detail-type';

const BASE_URL = 'https://equran.id/api/v2';

/**
 * fetchAllSurah
 */
export async function fetchAllSurah(): Promise<Datum[]> {
  const url = `${BASE_URL}/surat`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`fetchAllSurah failed: HTTP ${res.status}`);
  }

  const json = (await res.json()) as SurahResponse | null;
  if (!json || !Array.isArray(json.data)) {
    throw new Error('fetchAllSurah: unexpected response shape');
  }

  return json.data;
}

/**
 * fetchSurahDetailRaw
 * Return the raw response object for /surat/{id}
 * We implement two helpers:
 * - fetchSurahByNumber() -> returns Datum (the "light" object used for list)
 * - fetchSurahDetail() -> returns Data (the full detail with ayat[])
 *
 * Some endpoints may return same shape; we try to parse both types robustly.
 */
async function fetchSurahRaw(nomor: number): Promise<SurahResponse | SurahDetailResponse> {
  const url = `${BASE_URL}/surat/${nomor}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`fetchSurahRaw failed: HTTP ${res.status}`);
  }

  const json = await res.json();
  return json;
}

/**
 * fetchSurahByNumber (light)
 */
export async function fetchSurahByNumber(nomor: number): Promise<Datum> {
  if (!Number.isFinite(nomor)) throw new Error('Invalid nomor');

  const json = (await fetchSurahRaw(nomor)) as SurahResponse | SurahDetailResponse;

  // try to normalize: either shape may exist; prefer Datum if available inside data[0]
  if (!json || !Array.isArray((json as any).data) || (json as any).data.length === 0) {
    throw new Error(`Surah ${nomor} not found (fetchSurahByNumber)`);
  }

  // Map first element: if shape contains ayat, still return Datum-compatible subset
  const first = (json as any).data[0];

  // ensure required fields exist
  if (typeof first.nomor !== 'number' || typeof first.namaLatin !== 'string') {
    throw new Error(`Surah ${nomor} response invalid shape`);
  }

  // build Datum-compatible object (safe)
  const datum: Datum = {
    nomor: first.nomor,
    nama: first.nama ?? first.namaLatin ?? '',
    namaLatin: first.namaLatin,
    jumlahAyat: first.jumlahAyat ?? first.ayat?.length ?? 0,
    tempatTurun: first.tempatTurun ?? 'Mekah',
    arti: first.arti ?? '',
    deskripsi: first.deskripsi ?? '',
    audioFull: first.audioFull ?? {},
  };

  return datum;
}

/**
 * fetchSurahDetail (full)
 */
export async function fetchSurahDetail(nomor: number): Promise<Data> {
  if (!Number.isFinite(nomor)) {
    throw new Error('Invalid surah number');
  }

  const res = await fetch(`${BASE_URL}/surat/${nomor}`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - Failed to fetch surah detail ${nomor}`);
  }

  const json = await res.json();

  if (!json?.data) {
    throw new Error(`Surah ${nomor} not found`);
  }

  return json.data; // langsung object
}