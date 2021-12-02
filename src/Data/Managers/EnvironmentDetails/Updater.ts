import { ApiHelper, Query, RemoteData, StateHelper, Updater } from "@/Core";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsUpdater
  implements Updater<"GetEnvironmentDetails">
{
  constructor(
    private readonly stateHelper: StateHelper<"GetEnvironmentDetails">,
    private readonly apiHelper: ApiHelper,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"GetEnvironmentDetails">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(
          getUrl(query.details, this.environment),
          this.environment
        )
      ),
      query
    );
  }
}
