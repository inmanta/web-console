import { DataManager, RemoteData, Query, StateHelper, Fetcher } from "@/Core";

type Data<Kind extends Query.Kind> = RemoteData.Type<
  Query.Error<Kind>,
  Query.Data<Kind>
>;

export class DataManagerImpl<Kind extends Query.Kind>
  implements DataManager<Kind> {
  constructor(
    private readonly fetcher: Fetcher<Kind>,
    private readonly stateHelper: StateHelper<Kind>
  ) {}

  initialize(qualifier: Query.Qualifier<Kind>): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(
        await this.fetcher.getData(qualifier.environment, url)
      )
    );
  }

  get(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    return this.stateHelper.getHooked(qualifier);
  }
}
