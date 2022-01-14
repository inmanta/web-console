import { Location } from "history";
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
    private readonly useLocation: () => Location,
    private readonly navigate: (pathname: string) => void,
    private readonly routeManager: RouteManager
  ) {}

  set(location: Location, environmentId: string): void {
    const { pathname, search } = location;
    const params = new URLSearchParams(search);
    console.log("EnvHandler set: ", {
      environmentId,
      paramsEnv: params.get("env"),
    });
    if (params.get("env") !== environmentId) {
      params.set("env", environmentId);
      this.navigate(
        this.routeManager.getRelatedUrlWithoutParams(pathname) + `?${params}`
      );
    }
  }

  useId(): string {
    const environment = this.useSelected();
    if (typeof environment === "undefined") {
      throw new Error("environment required but missing");
    }
    console.log("UseId: ", environment.id);
    return environment.id;
  }

  useSelected(): FlatEnvironment | undefined {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const allEnvironments = useStoreState(
      (state) => state.environments.environments
    );
    const { search } = this.useLocation();
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
