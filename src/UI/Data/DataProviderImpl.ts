import { DataProvider, Query, HookHelper, RemoteData } from "@/Core";

type Helper<K extends Query.Kind> = HookHelper<Query.SubQuery<K>>;

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.Data<K>
>;

export class DataProviderImpl implements DataProvider {
  constructor(private readonly hookHelpers: HookHelper[]) {}

  getHelper(query: Query.Type): Helper<typeof query.kind> {
    const hookHelper = this.hookHelpers.find((helper) => helper.matches(query));
    if (typeof hookHelper !== "undefined") {
      return hookHelper as Helper<typeof query.kind>;
    }
    throw new Error(`Can't find HookHelper for query ${query.kind}`);
  }

  useSubscription(query: Query.Type): void {
    const helper = this.getHelper(query);
    helper.useSubscription(query);
  }

  useData(query: Query.Type): Data<typeof query.kind> {
    const helper = this.getHelper(query);
    return helper.useData(query);
  }
}
