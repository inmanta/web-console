import { useLocation } from "react-router-dom";
import {
  EnvironmentHandler,
  FlatEnvironment,
  RemoteData,
  RouteManager,
} from "@/Core";
import { useStoreState } from "@/Data/Store";
import { SearchHelper } from "@/UI/Routing/SearchHelper";

export class EnvironmentHandlerImpl implements EnvironmentHandler {
  constructor(
    private readonly location: { pathname: string; search: string },
    private readonly navigate: (path: string) => void,
    private readonly routeManager: RouteManager
  ) {}

  public set(environmentId: string): void {
    const params = new URLSearchParams(this.location.search);
    if (params.get("env") !== environmentId) {
      params.set("env", environmentId);
      this.navigate(
        this.routeManager.getRelatedUrlWithoutParams(this.location.pathname) +
          `?${params}`
      );
    }
  }

  public useSelected(): FlatEnvironment | undefined {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const allEnvironments = useStoreState(
      (state) => state.environments.environments
    );
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const { search } = useLocation();
    return this.determineSelected(allEnvironments, search);
  }

  determineSelected(
    allEnvironments: RemoteData.Type<string, FlatEnvironment[]>,
    search: string
  ): FlatEnvironment | undefined {
    const searchHelper = new SearchHelper();
    const parsed = searchHelper.parse(search);
    const envId = parsed["env"];
    if (envId && allEnvironments.kind === "Success") {
      const env = allEnvironments.value.find(
        (environment) => environment.id === envId
      );
      return env;
    }
    return;
  }
}
