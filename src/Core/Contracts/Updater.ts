import { Query } from "@/Core/Domain";

export interface Updater<K extends Query.Kind> {
  update(query: Query.SubQuery<K>): Promise<void>;
}
