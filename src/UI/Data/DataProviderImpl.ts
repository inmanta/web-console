import { DataProvider, Query, HookHelper, RemoteData } from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.Data<K>
>;

export class DataProviderImpl implements DataProvider {
  constructor(private readonly hookHelpers: HookHelper<Query.Kind>[]) {}

  private getHelper(query: Query.Type): HookHelper<typeof query.kind> {
    const hookHelper = this.hookHelpers.find((helper) => helper.matches(query));
    if (typeof hookHelper !== "undefined") {
      return hookHelper as HookHelper<typeof query.kind>;
    }
    throw new Error(`Can't find HookHelper for query ${query.kind}`);
  }

  useContinuous(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getHelper(query);
    helper.useSubscription(query.qualifier);
    return [
      helper.useData(query.qualifier),
      () => helper.trigger(query.qualifier),
    ];
  }
}
