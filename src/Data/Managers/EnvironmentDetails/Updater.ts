import {
  ApiHelper,
  Query,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsUpdater
  implements UpdaterWithEnv<"GetEnvironmentDetails">
{
  constructor(
    private readonly stateHelper: StateHelperWithEnv<"GetEnvironmentDetails">,
    private readonly apiHelper: ApiHelper
  ) {}

  async update(
    query: Query.SubQuery<"GetEnvironmentDetails">,
    environment: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(
          getUrl(query.details, environment),
          environment
        )
      ),
      query,
      environment
    );
  }
}
