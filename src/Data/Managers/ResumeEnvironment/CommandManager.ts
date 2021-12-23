import {
  ApiHelper,
  RemoteData,
  StateHelperWithEnv,
  UpdaterWithEnv,
} from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class ResumeEnvironmentCommandManager extends CommandManagerWithEnv<"ResumeEnvironment"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelperWithEnv<"GetEnvironmentDetails">,
    private readonly updater: UpdaterWithEnv<"GetEnvironmentDetails">
  ) {
    super("ResumeEnvironment", (command, environment) => {
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
          `/api/v2/actions/environment/resume`,
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
