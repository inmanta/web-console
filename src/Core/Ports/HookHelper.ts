import { Query } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

type Pair<K extends Query.Kind> = [Data<K>, () => void];

export type HelperKind = "OneTime" | "Continuous";

/**
 * The HookHelper defines data hooks for a specific 'kind' of query.
 * This correlates to a specific data source.
 *
 * The matches method dictates what kind of query this helper supports.
 */
export interface OneTimeHookHelper<K extends Query.Kind> {
  useOneTime(qualifier: Query.Qualifier<K>): Pair<K>;
  matches(query: Query.Type, helperKind: HelperKind): boolean;
}

export interface ContinuousHookHelper<K extends Query.Kind> {
  useContinuous(qualifier: Query.Qualifier<K>): Pair<K>;
  matches(query: Query.Type, helperKind: HelperKind): boolean;
}
