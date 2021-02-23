import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;

export class ServiceDataManager implements DataManager<Data> {
  constructor(
    private readonly fetcher: Fetcher<"Service">,
    private readonly stateHelper: StateHelper<
      Query.Error<"Service">,
      Query.Data<"Service">
    >
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.getOnce(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(query: Query.ServiceQuery): Promise<void> {
    this.stateHelper.set(
      query.qualifier.name,
      RemoteData.fromEither(await this.fetcher.getData(query))
    );
  }

  get(id: string): Data {
    return this.stateHelper.getHooked(id);
  }
}
