import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { getUrl } from "@/Data/Managers/GetProjects/getUrl";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";

export class GetEnvironmentsQueryManager extends PrimaryOneTimeQueryManager<"GetEnvironments"> {
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
      identity
    );
  }
}
