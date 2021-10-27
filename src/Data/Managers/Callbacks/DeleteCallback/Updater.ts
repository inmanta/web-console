import { ApiHelper, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";

export class CallbacksUpdater implements Updater<"GetCallbacks"> {
  constructor(
    private readonly stateHelper: StateHelper<"GetCallbacks">,
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"GetCallbacks">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(getUrl(), this.environment)
      ),
      query
    );
  }
}
