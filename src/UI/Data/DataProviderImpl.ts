import {
  DataProvider,
  Query,
  RemoteData,
  OneTimeHookHelper,
  ContinuousHookHelper,
} from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

type HookHelpers = (
  | OneTimeHookHelper<Query.Kind>
  | ContinuousHookHelper<Query.Kind>
)[];

export class DataProviderImpl implements DataProvider {
  constructor(private readonly hookHelpers: HookHelpers) {}

  private getOneTimeHelper(
    query: Query.Type
  ): OneTimeHookHelper<typeof query.kind> {
    const hookHelper = this.hookHelpers.find((helper) =>
      helper.matches(query, "OneTime")
    );
    if (typeof hookHelper !== "undefined") {
      return hookHelper as OneTimeHookHelper<typeof query.kind>;
    }
    throw new Error(`Can't find OneTimeHookHelper for query ${query.kind}`);
  }

  useOneTime(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getOneTimeHelper(query);
    return helper.useOneTime(query.qualifier);
  }

  private getContinuousHelper(
    query: Query.Type
  ): ContinuousHookHelper<typeof query.kind> {
    const hookHelper = this.hookHelpers.find((helper) =>
      helper.matches(query, "Continuous")
    );
    if (typeof hookHelper !== "undefined") {
      return hookHelper as ContinuousHookHelper<typeof query.kind>;
    }
    throw new Error(`Can't find ContinuousHookHelper for query ${query.kind}`);
  }

  useContinuous(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getContinuousHelper(query);
    return helper.useContinuous(query.qualifier);
  }
}
