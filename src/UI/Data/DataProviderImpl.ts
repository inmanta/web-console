import {
  DataProvider,
  Query,
  RemoteData,
  OneTimeDataManager,
  ContinuousDataManager,
  DataManager,
} from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

export class DataProviderImpl implements DataProvider {
  constructor(private readonly dataManagers: DataManager[]) {}

  private getOneTimeDataManager(
    query: Query.Type
  ): OneTimeDataManager<typeof query.kind> {
    const dataManager = this.dataManagers.find((helper) =>
      helper.matches(query, "OneTime")
    );
    if (typeof dataManager !== "undefined") {
      return dataManager as OneTimeDataManager<typeof query.kind>;
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
    const dataManager = this.dataManagers.find((helper) =>
      helper.matches(query, "Continuous")
    );
    if (typeof dataManager !== "undefined") {
      return dataManager as ContinuousDataManager<typeof query.kind>;
    }
    throw new Error(`Can't find ContinuousDataManager for query ${query.kind}`);
  }

  useContinuous(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getContinuousDataManager(query);
    return helper.useContinuous(query.qualifier);
  }
}
