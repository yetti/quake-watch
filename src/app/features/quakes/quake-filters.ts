import { Quake } from '../../shared/quake';
import { LowerFilterLimit, UpperFilterLimit } from '../../shared/filter-limits';

const MS_PER_HOUR = 3_600_000;

export function withinHoursOf(quake: Quake, limit: UpperFilterLimit | null, now: number) {
  if (limit) {
    return quake.time >= now - limit.max * MS_PER_HOUR;
  }
  return true;
}

export function atLeastMagnitudeOf(quake: Quake, limit: LowerFilterLimit | null) {
  if (limit) {
    return quake.magnitude >= limit.min;
  }
  return true;
}
