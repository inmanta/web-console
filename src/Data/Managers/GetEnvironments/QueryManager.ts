import { identity } from "lodash-es";
import { StateHelper, ApiHelper } from "@/Core";
import { QueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "@S/Settings/Data/GetProjects/getUrl";

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
