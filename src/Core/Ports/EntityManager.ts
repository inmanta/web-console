import { Query } from "@/Core/Domain";

export interface EntityManager<Data = unknown> {
  initialize(id: string): void;
  update(query: Query.Type): Promise<void>;
  get(id: string): Data;
}
