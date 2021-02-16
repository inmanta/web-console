import { Query } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.Data<K>
>;

/**
 * The HookHelper defines data hooks for a specific 'kind' of query.
 * This correlates to a specific data source.
 *
 * The matches method dictates what kind of query this helper supports.
 */
export interface HookHelper<Q extends Query.Type = Query.Type> {
  useSubscription(query: Q): void;
  useData(query: Q): Data<typeof query.kind>;
  matches(query: Query.Type): boolean;
}
