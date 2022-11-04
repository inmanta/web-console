import {
  ApiHelper,
  Query,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { getUrl } from "@S/ServiceDetails/Data/Callbacks/getUrl";

export class CallbacksUpdater implements UpdaterWithEnv<"GetCallbacks"> {
  constructor(
    private readonly stateHelper: StateHelperWithEnv<"GetCallbacks">,
    private readonly apiHelper: ApiHelper
  ) {}

  async update(
    query: Query.SubQuery<"GetCallbacks">,
    environment: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(getUrl(), environment)),
      query,
      environment
    );
  }
}
