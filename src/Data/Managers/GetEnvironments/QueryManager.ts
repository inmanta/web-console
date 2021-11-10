import { identity } from "lodash";
import { StateHelper, ApiHelper } from "@/Core";
import { PrimaryOneTimeQueryManager } from "@/Data/Managers/Helpers";
import { getUrl } from "./getUrl";

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
      getUrl,
      identity
    );
  }
}
