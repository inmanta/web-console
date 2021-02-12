import { DataManager, Query, HookHelper, QueryInfo } from "@/Core";

export class DataManagerImpl implements DataManager {
  constructor(private readonly hookHelpers: HookHelper[]) {}

  getHelper(query: Query): QueryInfo[typeof query.kind]["hookHelper"] {
    const hookHelper = this.hookHelpers.find((helper) => helper.matches(query));
    if (typeof hookHelper !== "undefined") {
      return hookHelper as QueryInfo[typeof query.kind]["hookHelper"];
    }
    throw new Error(`Can't find HookHelper for query ${query.kind}`);
  }

  useSubscription(query: Query): void {
    const helper = this.getHelper(query);
    helper.useSubscription(query);
  }

  useData(query: Query): QueryInfo[typeof query.kind]["data"] {
    const helper = this.getHelper(query);
    return helper.useData(query);
  }
}
