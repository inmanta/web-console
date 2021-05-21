import {
  DataProvider,
  Query,
  RemoteData,
  OneTimeQueryManager,
  ContinuousQueryManager,
  QueryManager,
  ManagerResolver,
} from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

export class DataProviderImpl implements DataProvider {
  constructor(public readonly managerResolver: ManagerResolver<QueryManager>) {}

  getManagerResolver(): ManagerResolver<QueryManager> {
    return this.managerResolver;
  }

  private getOneTimeDataManager(
    query: Query.Type
  ): OneTimeQueryManager<typeof query.kind> {
    const dataManager = this.managerResolver
      .get()
      .find((helper) => helper.matches(query, "OneTime"));
    if (typeof dataManager !== "undefined") {
      return dataManager as OneTimeQueryManager<typeof query.kind>;
    }
    throw new Error(`Can't find OneTimeDataManager for query ${query.kind}`);
  }

  useOneTime(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getOneTimeDataManager(query);
    return helper.useOneTime(query.qualifier);
  }

  private getContinuousDataManager(
    query: Query.Type
  ): ContinuousQueryManager<typeof query.kind> {
    const dataManager = this.managerResolver
      .get()
      .find((helper) => helper.matches(query, "Continuous"));
    if (typeof dataManager !== "undefined") {
      return dataManager as ContinuousQueryManager<typeof query.kind>;
    }
    throw new Error(`Can't find ContinuousDataManager for query ${query.kind}`);
  }

  useContinuous(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getContinuousDataManager(query);
    return helper.useContinuous(query.qualifier);
  }
}
