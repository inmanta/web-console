import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { getUrl } from "@/Data/Managers/GetProjects/getUrl";
import { QueryManager } from "@/Data/Managers/Helpers";

export class GetEnvironmentsQueryManager extends QueryManager.OneTime<"GetEnvironments"> {
  constructor(
    apiHelper: ApiHelper,
    stateHelper: StateHelper<"GetEnvironments">
  ) {
    super(
      apiHelper,
      stateHelper,
      () => [],
      "GetEnvironments",
      ({ details }) => getUrl(details),
      identity,
      "MERGE"
    );
  }
}
