export const GEAR_OPTIONS = ['N', '1', '2', '3', '4', '5', 'R'] as const;

export type GearOption = (typeof GEAR_OPTIONS)[number];

export const DEFAULT_GEAR: GearOption = 'N';
