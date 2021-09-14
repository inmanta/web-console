import { Fetcher, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";

export class CallbacksUpdater implements Updater<"Callbacks"> {
  constructor(
    private readonly stateHelper: StateHelper<"Callbacks">,
    private readonly fetcher: Fetcher<"Callbacks">,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"Callbacks">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.fetcher.getData(this.environment, getUrl())
      ),
      query
    );
  }
}
