import { Fetcher, Query, RemoteData, StateHelper, Updater } from "@/Core";

export class EnvironmentDetailsUpdater
  implements Updater<"EnvironmentDetails">
{
  constructor(
    private readonly stateHelper: StateHelper<"EnvironmentDetails">,
    private readonly fetcher: Fetcher<"EnvironmentDetails">,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<"EnvironmentDetails">): Promise<void> {
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
