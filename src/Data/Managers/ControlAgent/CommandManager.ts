import { ApiHelper, UpdaterWithEnv } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function ControlAgentCommandManager(
  apiHelper: ApiHelper,
  updater: UpdaterWithEnv<"GetAgents">,
) {
  return CommandManagerWithEnv<"ControlAgent">(
    "ControlAgent",
    ({ name, action }, environment) => {
      return async (query) => {
        const result = await apiHelper.postWithoutResponse(
          `/api/v2/agent/${encodeURIComponent(name)}/${action}`,
          environment,
          null,
        );
        await updater.update(query, environment);
        return result;
      };
    },
  );
}
