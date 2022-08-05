import { omit } from "lodash-es";
import { Either, Maybe, ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class CreateCallbackCommandManager extends CommandManagerWithEnv<"CreateCallback"> {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly updater: UpdaterWithEnv<"GetCallbacks">
  ) {
    super("CreateCallback", (command, environment) => {
      return async () => {
        const result = await this.apiHelper.post(
          "/lsm/v1/callbacks",
          environment,
          omit(command, "kind")
        );
        if (Either.isLeft(result)) {
          return Maybe.some(result.value);
        } else {
          await this.updater.update(
            {
              kind: "GetCallbacks",
              service_entity: command.service_entity,
            },
            environment
          );
          return Maybe.none();
        }
      };
    });
  }
}
