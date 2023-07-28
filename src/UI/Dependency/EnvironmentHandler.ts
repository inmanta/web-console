import { Location } from "history";
import {
  EnvironmentHandler,
  FlatEnvironment,
  Navigate,
  RemoteData,
  RouteManager,
} from "@/Core";
import { useStoreState } from "@/Data/Store";
import { SearchHelper } from "@/UI/Routing/SearchHelper";

export function EnvironmentHandlerImpl(
  useLocation: () => Location,
  routeManager: RouteManager,
): EnvironmentHandler {
  function set(
    navigate: Navigate,
    location: Location,
    environmentId: string,
  ): void {
    const { pathname, search } = location;
    const params = new URLSearchParams(search);
    if (params.get("env") !== environmentId) {
      params.set("env", environmentId);
      navigate(
        routeManager.getRelatedUrlWithoutParams(pathname) + `?${params}`,
      );
    }
  }

  function useId(): string {
    const environment = useSelected();
    if (typeof environment === "undefined") {
      throw new Error("environment required but missing");
    }
    return environment.id;
  }

  function useSelected(): FlatEnvironment | undefined {
    const allEnvironments = useStoreState(
      (state) => state.environment.environments,
    );
    const { search } = useLocation();
    return determineSelected(allEnvironments, search);
  }

  function determineSelected(
    allEnvironments: RemoteData.Type<string, FlatEnvironment[]>,
    search: string,
  ): FlatEnvironment | undefined {
    const searchHelper = new SearchHelper();
    const parsed = searchHelper.parse(search);
    const envId = parsed["env"];
    if (envId && allEnvironments.kind === "Success") {
      const env = allEnvironments.value.find(
        (environment) => environment.id === envId,
      );
      return env;
    }
    return;
  }
  return {
    set,
    useId,
    useSelected,
    determineSelected,
  };
}
