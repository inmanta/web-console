import {
  ApiHelper,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { CommandManagerWithEnv } from "@/Data";

export class HaltEnvironmentCommandManager extends CommandManagerWithEnv<"HaltEnvironment"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelperWithEnv<"GetEnvironmentDetails">,
    private readonly updater: UpdaterWithEnv<"GetEnvironmentDetails">
  ) {
    super("HaltEnvironment", (command, environment) => {
      return async () => {
        this.stateHelper.set(
          RemoteData.loading(),
          {
            kind: "GetEnvironmentDetails",
            details: false,
          },
          environment
        );
        const result = await this.apiHelper.postWithoutResponse(
          `/api/v2/actions/environment/halt`,
          environment,
          null
        );
        await this.updater.update(
          {
            kind: "GetEnvironmentDetails",
            details: false,
          },
          environment
        );
        return result;
      };
    });
  }
}
