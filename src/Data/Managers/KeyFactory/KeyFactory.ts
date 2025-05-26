/**
 * A factory class for generating and managing key combinations used in data management.
 * This class helps create consistent key patterns by combining slice keys, entity keys,
 * and additional identifiers.
 */
export class KeyFactory {
  private key: string;
  private sliceKey: string;

  /**
   * Creates a new instance of KeyFactory.
   * @param {string} sliceKey - The base slice key used for data partitioning - e.g. "compilation"
   * @param {string} [key] - Optional entity key to be combined with the slice key - e.g. "getCompileDetails" - convention is to unless we want to trigger all queries from the slice we should provide a key
   */
  constructor(sliceKey: string, key?: string) {
      this.key = key || "";
      this.sliceKey = sliceKey;
  }

  /**
   * Returns an array containing the slice key and entity key.
   * @returns {string[]} Array containing [sliceKey, key]
   */
  all(): string[] {
    return [this.sliceKey, this.key];
  }

  /**
   * Generates a unique key combination by combining the base keys with an ID and optional extra keys.
   * @param {string} id - The unique identifier to be added to the key combination
   * @param {string[]} extra - Optional array of additional keys to be appended
   * @returns {string[]} Array containing [sliceKey, key, id, ...extra]
   */
  unique(id: string, extra?: string[]): string[] {
      return [...this.all(), id, ...(extra || [])];
  }
}

