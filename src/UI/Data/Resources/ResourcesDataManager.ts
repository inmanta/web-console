import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Resources">, Query.Data<"Resources">>;

export class ResourcesDataManager implements DataManager<Data> {
  constructor(
    private readonly fetcher: Fetcher<"Resources">,
    private readonly stateHelper: StateHelper<string, Query.Data<"Resources">>
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.getOnce(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(query: Query.ResourcesQuery): Promise<void> {
    this.stateHelper.set(
      query.qualifier.id,
      RemoteData.fromEither(await this.fetcher.getData(query))
    );
  }

  get(id: string): Data {
    return this.stateHelper.getHooked(id);
  }
}
