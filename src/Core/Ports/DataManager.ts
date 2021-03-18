import { Query } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";

/**
 * The DataManager is responsible for managing data.
 *
 * This should not own any data. It is just a small
 * extra wrapper to hide details. It still uses a
 * state provider which does own the data.
 */
export interface DataManager<K extends Query.Kind> {
  initialize(qualifier: Query.Qualifier<K>): void;
  update(qualifier: Query.Qualifier<K>, url: string): Promise<void>;
  get(
    qualifier: Query.Qualifier<K>
  ): RemoteData.Type<Query.Error<K>, Query.Data<K>>;
}
