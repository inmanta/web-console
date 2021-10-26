import { Fetcher, Query, RemoteData, StateHelper, Updater } from "@/Core";

export class EnvironmentDetailsUpdater
  implements Updater<"GetEnvironmentDetails">
{
  constructor(
    private readonly stateHelper: StateHelper<"GetEnvironmentDetails">,
    private readonly fetcher: Fetcher<"GetEnvironmentDetails">,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"GetEnvironmentDetails">): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.fetcher.getData(
          this.environment,
          `/api/v2/environment/${this.environment}`
        )
      ),
      query
    );
  }
}
