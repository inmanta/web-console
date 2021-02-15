import { Query } from "@/Core/Domain";
import { RemoteData } from "@/Core/Language";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.Data<K>
>;

export interface HookHelper<Q extends Query.Type = Query.Type> {
  useSubscription(query: Q): void;
  useData(query: Q): Data<typeof query.kind>;
  matches(query: Query.Type): boolean;
}
