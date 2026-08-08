export interface FilterLimit {
  readonly label: string;
}

export interface UpperFilterLimit extends FilterLimit {
  readonly max: number;
}

export interface LowerFilterLimit extends FilterLimit {
  readonly min: number;
}

export const HOUR_LIMITS: readonly UpperFilterLimit[] = [
  { label: 'Last 4 hours', max: 4 },
  { label: 'Last 24 hours', max: 24 },
];

export const MAGNITUDE_LIMITS: readonly LowerFilterLimit[] = [
  { label: '2.5+', min: 2.5 },
  { label: '5+', min: 5 },
];
