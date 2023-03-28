import { ApiHelper, AuthHelper, ParsedNumber, SetStateBody } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function TriggerForceStateCommandManager(
  authHelper: AuthHelper,
  apiHelper: ApiHelper
) {
  return CommandManagerWithEnv<"TriggerForceState">(
    "TriggerForceState",
    ({ service_entity, id, version }, environment) =>
      (targetState) =>
        apiHelper.postWithoutResponse(
          `/lsm/v1/service_inventory/${service_entity}/${id}/expert/state`,
          environment,
          composeRequestBody(authHelper.getUsername(), targetState, version)
        )
  );
}

export const composeRequestBody = (
  username: string | null,
  targetState: string,
  version: ParsedNumber
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
