import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class TriggerCompileCommandManager extends CommandManagerWithEnv<"TriggerCompile"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super(
      "TriggerCompile",
      (command, environment) => (update) =>
        this.apiHelper.postWithoutResponseAndEnvironment(
          `/api/v1/notify/${environment}`,
          {
            update,
            metadata: {
              type: "console",
              message: "Compile triggered from the console",
            },
          }
        )
    );
  }
}
