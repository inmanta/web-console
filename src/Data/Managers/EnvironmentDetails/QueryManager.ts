import { identity } from "lodash-es";
import { Scheduler, ApiHelper, StateHelperWithEnv } from "@/Core";
import { PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsQueryManager extends PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelperWithEnv<"GetEnvironmentDetails">,
    scheduler: Scheduler
  ) {
    super(
      apiHelper,
      stateHelper,
      scheduler,
      ({ kind }, environment) => `${kind}_${environment}`,
      (query, environment) => [environment],
      "GetEnvironmentDetails",
      ({ details }, environment) => getUrl(details, environment),
      identity,
      (data) => {
        if (data.kind !== "Success") return;
        console.log("Update: ", { name: data.value.data.name });
      },
      (key) => {
        console.log("Unregister: ", { key });
      }
    );
  }
}
