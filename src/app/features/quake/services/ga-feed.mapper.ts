import { Quake } from "../../../shared/models/quake.models";
import { GaFeature } from "./ga-feed.models";

export function mapFeatureToQuake(feature: GaFeature): Quake {
  const g = feature.geometry;
  const p = feature.properties;

  return {
    id: p.event_id,
    place: p.description,
    magnitude: p.preferred_magnitude,
    time: Date.parse(p.origin_time),
    lng: g.coordinates[0],
    lat: g.coordinates[1],
    depth: p.depth,
    magnitudeType: p.preferred_magnitude_type,
    inAustralia: p.located_in_australia === 'Y',
    feltReportUrl: p.felt_report_url,
  };
}
