import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data<Kind extends Query.Kind> = RemoteData.Type<
  Query.Error<Kind>,
  Query.UsedData<Kind>
>;

export class DataManagerImpl<Kind extends Query.Kind>
  implements DataManager<Kind> {
  constructor(
    private readonly fetcher: Fetcher<Kind>,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      fetcher: Fetcher<Kind>,
      stateHelper: StateHelper<Kind>
    ) => Query.UsedData<Kind>
  ) {}

  initialize(qualifier: Query.Qualifier<Kind>): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<Kind>): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(await this.fetcher.getData(qualifier))
    );
  }

  get(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    return RemoteData.mapSuccessCombined(
      (data) => this.toUsed(data, this.fetcher, this.stateHelper),
      this.stateHelper.getHooked(qualifier)
    );
  }
}
