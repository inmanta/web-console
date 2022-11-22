export interface Uuid {
  full: string;
  short: string;
}

export const getUuidFromRaw = (raw: string): Uuid => ({
  full: raw,
  short: raw.substring(0, 4),
});

/**
 * Function to get shorten version of uuid
 *
 * @param raw full length uuid string
 * @returns first 8 characters of the uuid
 */
export const getShortUuidFromRaw = (raw: string): string => raw.substring(0, 8);
