import {
  ApiHelper,
  Query,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { getUrl } from "@S/DesiredState/Data/getUrl";

export class DesiredStatesUpdater
  implements UpdaterWithEnv<"GetDesiredStates">
{
  constructor(
    private readonly stateHelper: StateHelperWithEnv<"GetDesiredStates">,
    private readonly apiHelper: ApiHelper,
  ) {}

  async update(
    query: Query.SubQuery<"GetDesiredStates">,
    environment: string,
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(getUrl(query), environment),
      ),
      query,
      environment,
    );
  }
}
