import { Location } from "history";
import {
  EnvironmentHandler,
  FlatEnvironment,
  Navigate,
  RouteManager,
} from "@/Core";
import { SearchHelper } from "@/UI/Routing/SearchHelper";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";

export function EnvironmentHandlerImpl(
  useLocation: () => Location,
  routeManager: RouteManager,
): EnvironmentHandler {
  const environmentsData = useGetEnvironments().useContinuous();
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
    const { search } = useLocation();

    return determineSelected(search);
  }

  function determineSelected(search: string): FlatEnvironment | undefined {
    const searchHelper = new SearchHelper();
    const parsed = searchHelper.parse(search);
    const envId = parsed["env"];

    if (envId && environmentsData.isSuccess) {
      const env = environmentsData.data.find(
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
