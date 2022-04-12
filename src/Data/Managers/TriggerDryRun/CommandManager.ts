import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class CommandManager extends CommandManagerWithEnv<"TriggerDryRun"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super(
      "TriggerDryRun",
      ({ version }, environment) =>
        () =>
          this.apiHelper.postWithoutResponse(
            `/api/v2/dryrun/${version}`,
            environment,
            undefined
          )
    );
  }
}
