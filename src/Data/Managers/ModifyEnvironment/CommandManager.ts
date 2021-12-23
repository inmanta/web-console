import { ModifyEnvironmentParams, ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class ModifyEnvironmentCommandManager extends CommandManagerWithEnv<"ModifyEnvironment"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetEnvironmentDetails">
  ) {
    super(
      "ModifyEnvironment",
      (command, environment) => async (body: ModifyEnvironmentParams) => {
        const error = await this.apiHelper.postWithoutResponseAndEnvironment(
          `/api/v2/environment/${environment}`,
          body
        );
        await this.updater.update(
          {
            kind: "GetEnvironmentDetails",
            details: true,
          },
          environment
        );
        return error;
      }
    );
  }
}
