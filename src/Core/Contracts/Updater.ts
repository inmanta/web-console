import { Query } from "@/Core/Query";

export interface Updater<K extends Query.Kind> {
  update(query: Query.SubQuery<K>): Promise<void>;
}
