import { ApiHelper, Query, RemoteData, Updater } from "@/Core";
import { Store } from "@/Data/Store";
import { StateHelper } from "./StateHelper";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsUpdater
  implements Updater<"GetEnvironmentDetails">
{
  stateHelper: StateHelper;

  constructor(store: Store, private readonly apiHelper: ApiHelper) {
    this.stateHelper = new StateHelper(store);
  }

  async update(query: Query.SubQuery<"GetEnvironmentDetails">): Promise<void> {
    this.stateHelper.set(RemoteData.loading(), query);
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.getWithoutEnvironment(
          getUrl(query.details, query.id)
        )
      ),
      query
    );
  }
}
