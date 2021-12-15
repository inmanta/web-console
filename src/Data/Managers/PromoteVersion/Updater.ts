import { ApiHelper, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "@/Data/Managers/GetDesiredStates/getUrl";

export class DesiredStatesUpdater implements Updater<"GetDesiredStates"> {
  constructor(
    private readonly stateHelper: StateHelper<"GetDesiredStates">,
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"GetDesiredStates">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(getUrl(query), this.environment)
      ),
      query
    );
  }
}
