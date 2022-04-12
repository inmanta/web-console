import {
  QueryResolver,
  Query,
  RemoteData,
  OneTimeQueryManager,
  ContinuousQueryManager,
  QueryManager,
  ManagerResolver,
  ReadOnlyQueryManager,
} from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<
  Query.Error<K>,
  Query.UsedData<K>
>;

export class QueryResolverImpl implements QueryResolver {
  constructor(public readonly managerResolver: ManagerResolver<QueryManager>) {}

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
    return helper.useOneTime(query);
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
    return helper.useContinuous(query);
  }

  private getReadOnlyQueryManager(
    query: Query.Type
  ): ReadOnlyQueryManager<typeof query.kind> {
    const manager = this.managerResolver
      .get()
      .find((helper) => helper.matches(query, "ReadOnly"));
    if (typeof manager !== "undefined") {
      return manager as ReadOnlyQueryManager<typeof query.kind>;
    }
    throw new Error(`Can't find ReadOnlyQueryManager for query ${query.kind}`);
  }

  useReadOnly(query: Query.Type): Data<typeof query.kind> {
    const helper = this.getReadOnlyQueryManager(query);
    return helper.useReadOnly(query);
  }
}
