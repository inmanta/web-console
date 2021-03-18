import { Query } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

type Pair<K extends Query.Kind> = [Data<K>, () => void];

/**
 * The HookHelper defines data hooks for a specific 'kind' of query.
 * This correlates to a specific data source.
 *
 * The matches method dictates what kind of query this helper supports.
 */
export interface HookHelper<K extends Query.Kind> {
  useOnce(qualifier: Query.Qualifier<K>): Pair<K>;
  useSubscription(qualifier: Query.Qualifier<K>): Pair<K>;
  matches(query: Query.Type): boolean;
}
