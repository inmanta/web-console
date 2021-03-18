import { Query } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

/**
 * The HookHelper defines data hooks for a specific 'kind' of query.
 * This correlates to a specific data source.
 *
 * The matches method dictates what kind of query this helper supports.
 */
export interface HookHelper<K extends Query.Kind> {
  useOnce(qualifier: Query.Qualifier<K>): Data<K>;
  refreshOnce(qualifier: Query.Qualifier<K>): void;
  useSubscription(qualifier: Query.Qualifier<K>): Data<K>;
  refreshSubscription(qualifier: Query.Qualifier<K>): void;
  matches(query: Query.Type): boolean;
}
