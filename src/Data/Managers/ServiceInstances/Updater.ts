import {
  ApiHelper,
  Query,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { getUrl } from "./getUrl";

export class GetServiceInstancesUpdater
  implements UpdaterWithEnv<"GetServiceInstances">
{
  constructor(
    private readonly stateHelper: StateHelperWithEnv<"GetServiceInstances">,
    private readonly apiHelper: ApiHelper
  ) {}

  async update(
    query: Query.SubQuery<"GetServiceInstances">,
    environment: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        await this.apiHelper.get(getUrl(query), environment)
      ),
      query,
      environment
    );
  }
}
