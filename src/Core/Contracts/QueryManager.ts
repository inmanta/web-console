import { RemoteData } from "@/Core/Language";
import { Query } from "@/Core/Query";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

type Pair<K extends Query.Kind> = [Data<K>, () => void];

export type QueryManagerKind = "OneTime" | "Continuous" | "ReadOnly";

/**
 * The QueryManager defines data hooks for a specific 'kind' of query.
 * This correlates to a specific entity.
 * The matches method dictates what kind of query this manager supports.
 */
export type QueryManager =
  | OneTimeQueryManager<Query.Kind>
  | ContinuousQueryManager<Query.Kind>
  | ReadOnlyQueryManager<Query.Kind>;

export interface OneTimeQueryManager<K extends Query.Kind> {
  useOneTime(query: Query.SubQuery<K>): Pair<K>;
  matches(query: Query.Type, kind: QueryManagerKind): boolean;
}

export interface ContinuousQueryManager<K extends Query.Kind> {
  useContinuous(query: Query.SubQuery<K>): Pair<K>;
  matches(query: Query.Type, kind: QueryManagerKind): boolean;
}

export interface ReadOnlyQueryManager<K extends Query.Kind> {
  useReadOnly(query: Query.SubQuery<K>): Data<K>;
  matches(query: Query.Type, kind: QueryManagerKind): boolean;
}
