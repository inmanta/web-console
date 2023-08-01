import { ApiHelper, Query, RemoteData, UpdaterWithEnv } from "@/Core";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class GetAgentsUpdater implements UpdaterWithEnv<"GetAgents"> {
  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper,
  ) {}

  async update(
    query: Query.SubQuery<"GetAgents">,
    environment: string,
  ): Promise<void> {
    StateHelper(this.store).set(
      RemoteData.fromEither(
        await this.apiHelper.get(getUrl(query), environment),
      ),
      query,
      environment,
    );
  }
}
