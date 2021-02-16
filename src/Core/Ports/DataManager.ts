import { Query } from "@/Core/Domain";

/**
 * The DataManager is responsible for managing data.
 *
 * This should not own any data. It is just a small
 * extra wrapper to hide details. It still uses a
 * state provider which does own the data.
 */
export interface DataManager<Data = unknown> {
  initialize(id: string): void;
  update(query: Query.Type): Promise<void>;
  get(id: string): Data;
}
