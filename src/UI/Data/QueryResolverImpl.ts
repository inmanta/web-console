import {
  QueryResolver,
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

export class QueryResolverImpl implements QueryResolver {
  constructor(public readonly managerResolver: ManagerResolver<QueryManager>) {}

  getManagerResolver(): ManagerResolver<QueryManager> {
    return this.managerResolver;
  }

  private getOneTimeQueryManager(
    query: Query.Type
  ): OneTimeQueryManager<typeof query.kind> {
    const manager = this.managerResolver
      .get()
      .find((helper) => helper.matches(query, "OneTime"));
    if (typeof manager !== "undefined") {
      return manager as OneTimeQueryManager<typeof query.kind>;
    }
    throw new Error(`Can't find OneTimeQueryManager for query ${query.kind}`);
  }

  useOneTime(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getOneTimeQueryManager(query);
    return helper.useOneTime(query.qualifier);
  }

  private getContinuousQueryManager(
    query: Query.Type
  ): ContinuousQueryManager<typeof query.kind> {
    const manager = this.managerResolver
      .get()
      .find((helper) => helper.matches(query, "Continuous"));
    if (typeof manager !== "undefined") {
      return manager as ContinuousQueryManager<typeof query.kind>;
    }
    throw new Error(
      `Can't find ContinuousQueryManager for query ${query.kind}`
    );
  }

  useContinuous(query: Query.Type): [Data<typeof query.kind>, () => void] {
    const helper = this.getContinuousQueryManager(query);
    return helper.useContinuous(query.qualifier);
  }
}
