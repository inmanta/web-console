import { ApiHelper, AuthHelper, SetStateBody } from "@/Core";
import { CommandManagerWithEnv } from "@/Data";

export class TriggerSetStateCommandManager extends CommandManagerWithEnv<"TriggerSetState"> {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly apiHelper: ApiHelper
  ) {
    super(
      "TriggerSetState",
      ({ service_entity, id, version }, environment) =>
        (targetState) =>
          this.apiHelper.postWithoutResponse(
            `/lsm/v1/service_inventory/${service_entity}/${id}/state`,
            environment,
            getBody(this.authHelper.getUsername(), targetState, version)
          )
    );
  }
}

export const getBody = (
  username: string | null,
  targetState: string,
  version: number
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
