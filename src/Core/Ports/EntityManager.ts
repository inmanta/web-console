import { Query } from "@/Core/Domain";

export interface DataManager<Data = unknown> {
  initialize(id: string): void;
  update(query: Query.Type): Promise<void>;
  get(id: string): Data;
}
