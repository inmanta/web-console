import { useState } from "react";
import { Location } from "react-router";
import { EnvironmentHandler, FlatEnvironment, Navigate, RouteManager } from "@/Core";
import { SearchHelper } from "@/UI/Routing/SearchHelper";

/**
 * EnvironmentHandlerImpl is a React component that manages the environment selection and navigation.
 * It provides functions to set the current environment, get the selected environment, and determine the selected environment from the URL.
 *
 * @param {(): Location} useLocation - useLocation hook from react-router
 * @param {RouteManager} routeManager - The route manager to navigate between routes.
 *
 * @returns {EnvironmentHandler} An object containing the different available functions.
 */
export function EnvironmentHandlerImpl(
  useLocation: () => Location,
  routeManager: RouteManager
): EnvironmentHandler {
  const [allEnvs, setAllEnvs] = useState<FlatEnvironment[]>([]);

  function set(navigate: Navigate, location: Location, environmentId: string): void {
    const { pathname, search } = location;
    const params = new URLSearchParams(search);

    if (params.get("env") !== environmentId) {
      params.set("env", environmentId);
      navigate(routeManager.getRelatedUrlWithoutParams(pathname) + `?${params}`);
    }
  }

  function useId(): string {
    const environment = useSelected();

    if (typeof environment === "undefined") {
      throw new Error("environment required but missing");
    }

    return environment.id;
  }

  function useName(): string {
    const environment = useSelected();

    if (typeof environment === "undefined") {
      throw new Error("environment required but missing");
    }

    return environment.name;
  }

  function useSelected(): FlatEnvironment | undefined {
    const { search } = useLocation();

    return determineSelected(allEnvs, search);
  }

  function setAllEnvironments(environments: FlatEnvironment[]): void {
    setAllEnvs(environments);
  }

  function determineSelected(
    allEnvironments: FlatEnvironment[],
    search: string
  ): FlatEnvironment | undefined {
    const searchHelper = new SearchHelper();
    const parsed = searchHelper.parse(search);
    const envId = parsed["env"];

    if (envId) {
      const env = allEnvironments.find((environment) => environment.id === envId);

      return env;
    }

    return;
  }

  return {
    set,
    useId,
    useName,
    useSelected,
    determineSelected,
    setAllEnvironments,
  };
}
