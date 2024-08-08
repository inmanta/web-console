import { ApiHelper, Command, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function DeleteCallbackCommandManager(
  apiHelper: ApiHelper,
  updater: UpdaterWithEnv<"GetCallbacks">,
) {
  function getUrl({
    callbackId,
  }: Command.SubCommand<"DeleteCallback">): string {
    return `/lsm/v1/callbacks/${callbackId}`;
  }
  return CommandManagerWithEnv<"DeleteCallback">(
    "DeleteCallback",
    (command, environment) => {
      return async () => {
        const result = await apiHelper.delete(getUrl(command), environment);
        await updater.update(
          {
            kind: "GetCallbacks",
            service_entity: command.service_entity,
          },
          environment,
        );
        return result;
      };
    },
  );
}
