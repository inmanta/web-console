import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;

export class ServiceDataManager implements DataManager<"Service"> {
  constructor(
    private readonly fetcher: Fetcher<"Service">,
    private readonly stateHelper: StateHelper<"Service">
  ) {}

  initialize(qualifier: Query.Qualifier<"Service">): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<"Service">): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(await this.fetcher.getData(qualifier))
    );
  }

  get(qualifier: Query.Qualifier<"Service">): Data {
    return this.stateHelper.getHooked(qualifier);
  }
}
