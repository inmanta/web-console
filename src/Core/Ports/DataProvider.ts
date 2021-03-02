import { RemoteData } from "@/Core/Language";
import { Query } from "@/Core/Domain";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.Data<K>
>;

/**
 * The DataProvider is responsible for providing data to
 * components. This is based on hooks so that the logic is
 * attached to the component lifecycle. Data is provided
 * based on a query.
 */
export interface DataProvider {
  useContinuous<Kind extends Query.Kind>(
    query: Query.Type
  ): [Data<Kind>, () => void];
}
