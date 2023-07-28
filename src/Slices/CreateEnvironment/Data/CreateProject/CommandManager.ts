import { ApiHelper, Command, Either, ProjectModel, Updater } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";

export class CreateProjectCommandManager extends CommandManagerWithoutEnv<"CreateProject"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: Updater<"GetProjects">,
  ) {
    super("CreateProject", () => {
      return async (name: string) => {
        const result = await this.apiHelper.putWithoutEnvironment<
          { data: ProjectModel },
          Command.Body<"CreateProject">
        >(`/api/v2/project`, { name });
        if (Either.isRight(result)) {
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
