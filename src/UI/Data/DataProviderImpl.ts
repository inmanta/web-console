import {
  DataProvider,
  Query,
  RemoteData,
  OneTimeDataManager,
  ContinuousDataManager,
} from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

type DataManagers = (
  | OneTimeDataManager<Query.Kind>
  | ContinuousDataManager<Query.Kind>
)[];

export class DataProviderImpl implements DataProvider {
  constructor(private readonly dataManagers: DataManagers) {}

  private getOneTimeDataManager(
    query: Query.Type
  ): OneTimeDataManager<typeof query.kind> {
    const hookHelper = this.dataManagers.find((helper) =>
      helper.matches(query, "OneTime")
    );
    if (typeof hookHelper !== "undefined") {
      return hookHelper as OneTimeDataManager<typeof query.kind>;
    }
    throw new Error(`Can't find OneTimeDataManager for query ${query.kind}`);
  }

  useOneTime(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getOneTimeDataManager(query);
    return helper.useOneTime(query.qualifier);
  }

  private getContinuousDataManager(
    query: Query.Type
  ): ContinuousDataManager<typeof query.kind> {
    const hookHelper = this.dataManagers.find((helper) =>
      helper.matches(query, "Continuous")
    );
    if (typeof hookHelper !== "undefined") {
      return hookHelper as ContinuousDataManager<typeof query.kind>;
    }
    throw new Error(`Can't find ContinuousDataManager for query ${query.kind}`);
  }

  useContinuous(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getContinuousDataManager(query);
    return helper.useContinuous(query.qualifier);
  }
}
