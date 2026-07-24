import { GaFeature } from './ga-feed';
import { Quake } from '../shared/quake';

export function mapFeatureToQuake(feature: GaFeature): Quake {
  const geo = feature.geometry;
  const props = feature.properties;

  return {
    id: props.event_id,
    place: props.description,
    magnitude: props.preferred_magnitude,
    time: Date.parse(props.origin_time),
    lng: geo.coordinates[0],
    lat: geo.coordinates[1],
    depth: props.depth,
    magnitudeType: props.preferred_magnitude_type,
    inAustralia: props.located_in_australia === 'Y',
    feltReportUrl: props.felt_report_url,
  };
}
