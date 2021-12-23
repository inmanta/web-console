import { ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data";

export class PromoteVersionCommandManager extends CommandManagerWithEnv<"PromoteVersion"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetDesiredStates">
  ) {
    super("PromoteVersion", ({ version }, environment) => async (query) => {
      const result = await this.apiHelper.postWithoutResponse(
        `/api/v2/desiredstate/${version}/promote`,
        environment,
        null
      );
      await this.updater.update(query, environment);
      return result;
    });
  }
}
