import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Resources">, Query.Data<"Resources">>;

export class ResourcesDataManager implements DataManager<"Resources"> {
  constructor(
    private readonly fetcher: Fetcher<"Resources">,
    private readonly stateHelper: StateHelper<"Resources">
  ) {}

  initialize(qualifier: Query.Qualifier<"Resources">): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<"Resources">): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(await this.fetcher.getData(qualifier))
    );
  }

  get(qualifier: Query.Qualifier<"Resources">): Data {
    return this.stateHelper.getHooked(qualifier);
  }
}
