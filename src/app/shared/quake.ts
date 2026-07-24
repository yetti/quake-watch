export interface Quake {
  id: string;
  place: string;
  magnitude: number;
  time: number;
  lng: number;
  lat: number;
  depth: number;
  magnitudeType?: string;
  inAustralia?: boolean;
  feltReportUrl?: string;
}
