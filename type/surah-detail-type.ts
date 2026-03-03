export interface SurahDetailResponse {
  code: number;
  message: string;
  data: Data;
}

export interface Data {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: { [key: string]: string };
  ayat: Ayat[];
  suratSelanjutnya: SuratSenya;
  suratSebelumnya: SuratSenya;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: { [key: string]: string };
}

export interface SuratSenya {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
}
