import {
  ApiHelper,
  Query,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { getUrl } from "./getUrl";

export class GetAgentsUpdater implements UpdaterWithEnv<"GetAgents"> {
  constructor(
    private readonly stateHelper: StateHelperWithEnv<"GetAgents">,
    private readonly apiHelper: ApiHelper
  ) {}

  async update(
    query: Query.SubQuery<"GetAgents">,
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
