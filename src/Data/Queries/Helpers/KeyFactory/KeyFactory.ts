type KeyArray = (string | number | boolean)[];

/**
 * Factory class for generating unique keys for React Query
 */
export class KeyFactory {
  /**
   * Constructor for the KeyFactory class
   * @param {string} sliceKey - The slice key for the query
   * @param {string} queryKey - The query key for the query
   */
  constructor(
    private readonly sliceKey: string,
    private readonly queryKey?: string
  ) {
    this.queryKey = queryKey;
    this.sliceKey = sliceKey;
  }

  /**
   * returns the root key for the query
   * @returns {string[]} The root key for the query
   */
  public root(): string[] {
    const keyArray = [this.sliceKey];
    if (this.queryKey) {
      keyArray.push(this.queryKey);
    }
    return keyArray;
  }

  /**
   * returns the slice key for the query
   * @returns {string[]} The slice key for the query
   */
  public slice(): string[] {
    return [this.sliceKey];
  }

  /**
   * Generates the list key for the query that fetch a list of items/objects
   * @param {KeyArray} params - The parameters for the query
   * @returns {string[]} The list key for the query
   */
  public list(params?: KeyArray): KeyArray {
    return [...this.root(), "list", ...(params || [])];
  }

  /**
   * Generates the  key for the query that fetch single item/object
   * @param {string} id - The id for the query
   * @param {KeyArray} params - The parameters for the query
   * @returns {string[]} The single key for the query
   */
  public single(id: string, params?: KeyArray): KeyArray {
    return [...this.root(), "single", id, ...(params || [])];
  }
}

export enum SliceKeys {
  agents = "agents",
  auth = "auth",
  callback = "callback",
  compilation = "compilation",
  dashboard = "dashboard",
  desiredState = "desired_state",
  discoveredResource = "discovered_resource",
  dryRun = "dry_run",
  environment = "environment",
  facts = "facts",
  notification = "notification",
  order = "order",
  parameters = "parameters",
  project = "project",
  resource = "resource",
  server = "server",
  service = "service",
  serviceInstance = "service_instance",
}
