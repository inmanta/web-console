import { ApiHelper, Maybe, Updater } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";

export class CreateProjectCommandManager extends CommandManagerWithoutEnv<"CreateProject"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetProjects">
  ) {
    super("CreateProject", () => {
      return async (name: string) => {
        const result = await this.apiHelper.putWithoutResponseAndEnvironment(
          `/api/v2/project`,
          { name }
        );
        if (Maybe.isNone(result)) {
          await this.updater.update({
            kind: "GetProjects",
            environmentDetails: false,
          });
        }
        return result;
      };
    });
  }
}
