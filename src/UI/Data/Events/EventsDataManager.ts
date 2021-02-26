import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Events">, Query.Data<"Events">>;

export class EventsDataManager implements DataManager<Data> {
  constructor(
    private readonly fetcher: Fetcher<"Events">,
    private readonly stateHelper: StateHelper<string, Query.Data<"Events">>
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.getOnce(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(query: Query.InstanceEventsQuery): Promise<void> {
    this.stateHelper.set(
      query.qualifier.id,
      RemoteData.fromEither(await this.fetcher.getData(query))
    );
  }

  get(id: string): Data {
    return this.stateHelper.getHooked(id);
  }
}
