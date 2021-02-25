import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Services">, Query.Data<"Services">>;

export class ServicesDataManager implements DataManager<"Services"> {
  constructor(
    private readonly fetcher: Fetcher<"Services">,
    private readonly stateHelper: StateHelper<"Services">
  ) {}

  initialize(qualifier: Query.Qualifier<"Services">): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<"Services">): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(await this.fetcher.getData(qualifier))
    );
  }

  get(qualifier: Query.Qualifier<"Services">): Data {
    return this.stateHelper.getHooked(qualifier);
  }
}
