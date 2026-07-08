export interface GaGeometry {
  coordinates: [number, number];
}

export interface GaFeatureProperties {
  event_id: string;
  description: string;
  preferred_magnitude: number;
  preferred_magnitude_type: string;
  origin_time: string;
  depth: number;
  located_in_australia: 'Y' | 'N';
  felt_report_url: string;
}

export interface GaFeature {
  geometry: GaGeometry;
  properties: GaFeatureProperties;
}

export interface GaFeatureCollection {
  features: GaFeature[];
}
