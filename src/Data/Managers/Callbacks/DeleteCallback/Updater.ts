import { Fetcher, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";

export class CallbacksUpdater implements Updater<"GetCallbacks"> {
  constructor(
    private readonly stateHelper: StateHelper<"GetCallbacks">,
    private readonly fetcher: Fetcher<"GetCallbacks">,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"GetCallbacks">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.fetcher.getData(this.environment, getUrl())
      ),
      query
    );
  }
}
