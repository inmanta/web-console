import { ApiHelper, Maybe, Updater } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";

export class DeleteEnvironmentCommandManager extends CommandManagerWithoutEnv<"DeleteEnvironment"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetEnvironments">
  ) {
    super("DeleteEnvironment", ({ id }) => async () => {
      const error = await this.apiHelper.delete(
        `/api/v2/environment/${id}`,
        id
      );
      if (Maybe.isSome(error)) return error;
      await this.updater.update({
        kind: "GetEnvironments",
        details: true,
      });
      return error;
    });
  }
}
