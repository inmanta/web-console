import { identity } from "lodash-es";
import { ApiHelper, StateHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

export class EnvironmentDetailsOneTimeQueryManager extends QueryManager.OneTime<"GetEnvironmentDetails"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironmentDetails">
  ) {
    super(
      apiHelper,
      stateHelper,
      ({ id }) => [id],
      "GetEnvironmentDetails",
      ({ details, id }) => getUrl(details, id),
      identity,
      "MERGE"
    );
  }
}
