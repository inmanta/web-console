import { RemoteData } from "@/Core/Language";
import { Query } from "@/Core/Query";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

type Pair<K extends Query.Kind> = [Data<K>, () => void];

/**
 * The QueryResolver is responsible for providing data to
 * components. This is based on hooks so that the logic is
 * attached to the component lifecycle. Data is provided
 * based on a query.
 */
export interface QueryResolver {
  useReadOnly<Kind extends Query.Kind>(query: Query.Type): Data<Kind>;
  useOneTime<Kind extends Query.Kind>(query: Query.Type): Pair<Kind>;
  useContinuous<Kind extends Query.Kind>(query: Query.Type): Pair<Kind>;
  pauseAllContinuousManagers(): void;
  resumeAllContinuousManagers(): void;
}
