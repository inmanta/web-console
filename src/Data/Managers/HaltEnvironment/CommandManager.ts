import { ApiHelper, RemoteData, StateHelper, Updater } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class HaltEnvironmentCommandManager extends CommandManagerWithEnv<"HaltEnvironment"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetEnvironmentDetails">,
    private readonly updater: Updater<"GetEnvironmentDetails">
  ) {
    super("HaltEnvironment", (command, environment) => {
      return async () => {
        this.stateHelper.set(RemoteData.loading(), {
          kind: "GetEnvironmentDetails",
          details: false,
          id: environment,
        });
        const result = await this.apiHelper.postWithoutResponse(
          `/api/v2/actions/environment/halt`,
          environment,
          null
        );
        await this.updater.update({
          kind: "GetEnvironmentDetails",
          details: false,
          id: environment,
        });
        return result;
      };
    });
  }
}
