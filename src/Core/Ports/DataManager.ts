import { RemoteData } from "@/Core/Language";
import { Query } from "@/Core/Domain";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.Data<K>
>;

export interface DataManager {
  useSubscription(query: Query.Type): void;
  useData(query: Query.Type): Data<typeof query.kind>;
}
