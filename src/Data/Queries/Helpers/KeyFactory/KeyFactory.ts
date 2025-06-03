type KeyArray = (string | number | boolean)[];

/**
 * Factory class for generating keys arrays for React Query,
 *
 * Made to ease maintenance and readability of the code responsible for fetching data from the API
 * 
 * Managing all queries gets harder as the project grows, this class is here to help with that.
 * 
 * - It eliminates room for errors when we try to invalidate/refetch data, across the codebase. 
 * - it makes code easier to debug through react query devtools, as the queries are more uniform and structured.
 * - it will also make it easier to update queries in the future, as we now don't need to search for all off the modifications to the query across the codebase
 * 
 * Conventions:
 * - All queries related to the same slice will have the same slice key
 * - All queries related to the same query will have the same query key
 * - All queries related to the same slice and query will have the same key base
 * - Query keys from parameters should be identifiable, in case of boolean, or non-string values, they should be converted wrapped in Record<name,value> to improve readability in devTools
 * - All specific queries will have it's own reusable factory, that should be used in case of invalidation/refetch, unless there is already related factory, for example getEnvironment and GetEnvironments should share the Factory
 * - all query keys will be in singular form and differs only of the function used
 * @example
 *    - get specific environment 
 * 
 * export const exampleFactory = new KeyFactory(SliceKeys.environment, "get_environment");
 *  {...}
 * queryKey: exampleFactory.single(someId, [...params]),
 *  {...}
 * 
*    - get all environments
 *  {...}
 * queryKey: exampleFactory.list([..params]),
 *  {...}
 * 
 */
export class KeyFactory {
  /**
   * Constructor for the KeyFactory class
   * @param {string} sliceKey - The slice key for the query - it represent the slice of the data we want to fetch, our codebase and api is structured around slices, all queries related to the same slice will have the same slice key
   * @param {string} queryKey - The query key for the query - it represent the query we want to fetch, it will be different for each query, but the queries related to the same slice will have the same query key
   */
  constructor(
    private readonly sliceKey: string,
    private readonly queryKey?: string
  ) {
    this.queryKey = queryKey;
    this.sliceKey = sliceKey;
  }

  /**
   * returns the root key for the query, used when we want to refetch all the data related to the given specific query,
   * for example all get environment queries(single and list)
   * 
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
   * returns the slice key for the query, used when we want for example to refetch all the data related to the given slice,
   * for example all environemnts queries(get environments, get environment settings and so on)
   * 
   * @returns {string[]} The slice key for the query
   */
  public slice(): string[] {
    return [this.sliceKey];
  }

  /**
   * Generates the list key for the query that fetch a list of items/objects
   * 
   * @param {KeyArray} params - The parameters for the query
   * @returns {string[]} The list key for the query
   */
  public list(params?: KeyArray): KeyArray {
    return [...this.root(), "list", ...(params || [])];
  }

  /**
   * Generates the  key for the query that fetch single item/object
   * 
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
