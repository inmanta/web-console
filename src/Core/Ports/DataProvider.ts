import { RemoteData } from "@/Core/Language";
import { Query } from "@/Core/Domain";
import { ManagerResolverGetter } from "./ManagerResolver";
import { DataManager } from "./DataManager";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

type Pair<K extends Query.Kind> = [Data<K>, () => void];

/**
 * The DataProvider is responsible for providing data to
 * components. This is based on hooks so that the logic is
 * attached to the component lifecycle. Data is provided
 * based on a query.
 */
export interface DataProvider extends ManagerResolverGetter<DataManager> {
  useOneTime<Kind extends Query.Kind>(query: Query.Type): Pair<Kind>;
  useContinuous<Kind extends Query.Kind>(query: Query.Type): Pair<Kind>;
}
