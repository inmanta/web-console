import { omit } from "lodash-es";
import { Either, Maybe, ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function CreateCallbackCommandManager(
  apiHelper: ApiHelper,
  updater: UpdaterWithEnv<"GetCallbacks">,
) {
  return CommandManagerWithEnv<"CreateCallback">(
    "CreateCallback",
    (command, environment) => {
      return async () => {
        const result = await apiHelper.post(
          "/lsm/v1/callbacks",
          environment,
          omit(command, "kind"),
        );
        if (Either.isLeft(result)) {
          return Maybe.some(result.value);
        } else {
          await updater.update(
            {
              kind: "GetCallbacks",
              service_entity: command.service_entity,
            },
            environment,
          );
          return Maybe.none();
        }
      };
    },
  );
}
