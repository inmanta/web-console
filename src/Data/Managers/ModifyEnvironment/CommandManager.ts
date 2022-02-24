import { ModifyEnvironmentParams, ApiHelper, Updater } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class ModifyEnvironmentCommandManager extends CommandManagerWithEnv<"ModifyEnvironment"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetEnvironmentDetails">,
    private readonly listUpdater: Updater<"GetEnvironments">
  ) {
    super(
      "ModifyEnvironment",
      (command, environment) => async (body: ModifyEnvironmentParams) => {
        const error = await this.apiHelper.postWithoutResponseAndEnvironment(
          `/api/v2/environment/${environment}`,
          body
        );
        await this.updater.update({
          kind: "GetEnvironmentDetails",
          details: true,
          id: environment,
        });
        await this.listUpdater.update({
          kind: "GetEnvironments",
          details: true,
        });
        return error;
      }
    );
  }
}
