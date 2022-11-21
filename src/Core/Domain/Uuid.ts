export interface Uuid {
  full: string;
  short: string;
}

export const getUuidFromRaw = (raw: string): Uuid => ({
  full: raw,
  short: raw.substring(0, 4),
});

export const getShortUuidFromRaw = (raw: string): string => raw.substring(0, 8);
