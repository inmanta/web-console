import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Events">, Query.Data<"Events">>;

export class EventsDataManager implements DataManager<"Events"> {
  constructor(
    private readonly fetcher: Fetcher<"Events">,
    private readonly stateHelper: StateHelper<"Events">
  ) {}

  initialize(qualifier: Query.Qualifier<"Events">): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<"Events">): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(await this.fetcher.getData(qualifier))
    );
  }

  get(qualifier: Query.Qualifier<"Events">): Data {
    return this.stateHelper.getHooked(qualifier);
  }
}
