import { ApiHelper, ParsedNumber, SetStateBody } from "@/Core";
import { AuthContextInterface } from "@/Data/Auth";
import { CommandManagerWithEnv } from "@/Data/Common";

export function TriggerSetStateCommandManager(
  useAuth: AuthContextInterface,
  apiHelper: ApiHelper,
) {
  return CommandManagerWithEnv<"TriggerSetState">(
    "TriggerSetState",
    ({ service_entity, id, version }, environment) =>
      (targetState) =>
        apiHelper.postWithoutResponse(
          `/lsm/v1/service_inventory/${service_entity}/${id}/state`,
          environment,
          getBody(useAuth.getUser(), targetState, version),
        ),
  );
}

export const getBody = (
  username: string | null,
  targetState: string,
  version: ParsedNumber,
): SetStateBody => {
  const message = username
    ? `Triggered from the console by ${username}`
    : "Triggered from the console";
  return {
    current_version: version,
    target_state: targetState,
    message,
  };
};
