import { Fetcher, StateHelper } from "@/Core";
import { OneTimeQueryManagerImpl } from "@/Data/Common";
import { identity } from "lodash";
import { getUrl } from "@/Data/Managers/Callbacks/getUrl";

export class CallbacksQueryManager extends OneTimeQueryManagerImpl<"Callbacks"> {
  constructor(
    fetcher: Fetcher<"Callbacks">,
    stateHelper: StateHelper<"Callbacks">,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      () => [environment],
      "Callbacks",
      getUrl,
      identity,
      environment
    );
  }
}
