import { ApiHelper, Query, RemoteData, UpdaterWithEnv } from "@/Core";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class Updater implements UpdaterWithEnv<"GetNotifications"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly store: Store,
  ) {}

  async update(
    query: Query.SubQuery<"GetNotifications">,
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
