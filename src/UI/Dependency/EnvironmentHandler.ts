import { useCallback, useEffect, useState } from "react";
import { Location } from "react-router";
import {
  EnvironmentHandler,
  EnvironmentSettings,
  FlatEnvironment,
  Navigate,
  RouteManager,
} from "@/Core";
import { useGetEnvironmentSettings } from "@/Data/Queries";
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
  const { search } = useLocation();
  const [environments, setEnvironments] = useState<FlatEnvironment[]>([]);
  const [env, setEnv] = useState<FlatEnvironment | null>(null);
  const envSettings = useGetEnvironmentSettings(env?.id).useOneTime();

  function setAllEnvironments(environments: FlatEnvironment[]): void {
    setEnvironments(environments);
  }

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

  const useSelected = useCallback((): FlatEnvironment | undefined => {
    return determineSelected(environments, search);
  }, [environments, search]);

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

  function useIsHalted(): boolean {
    if (env === null) return false;

    return env.halted;
  }

  /**
   * check in the environment if the current settings exist if not it will try to fallback to envSettings definitions, in case of lack of env and lack of envSettings it will return false
   *
   * Currently envSettings are being fetched only when visiting env settings view due to re-rendering issues that came up through changing structure of the envModifier and Handler
   * It will be resolved with GraphQL update for the initial loading of the environments - https://github.com/inmanta/web-console/issues/6266
   * @param {keyof EnvironmentSettings.DefinitionMap} settingName
   * @returns {boolean}
   */
  function useSetting(settingName: keyof EnvironmentSettings.DefinitionMap): boolean {
    if (!envSettings.data) {
      return false;
    }
    if (
      envSettings.data.settings[settingName] !== undefined &&
      envSettings.data.settings[settingName] !== null
    ) {
      return Boolean(envSettings.data.settings[settingName]);
    } else if (
      envSettings.data.definition[settingName] !== undefined &&
      envSettings.data.definition[settingName] !== null
    ) {
      return Boolean(envSettings.data.definition[settingName]?.default);
    }
    return false;
  }

  function useIsServerCompileEnabled(): boolean {
    return useSetting("server_compile");
  }

  function useIsProtectedEnvironment(): boolean {
    return useSetting("protected_environment");
  }

  function useIsExpertModeEnabled(): boolean {
    return useSetting("enable_lsm_expert_mode");
  }

  useEffect(() => {
    setEnv(determineSelected(environments, search) || null);
  }, [search, environments]);

  return {
    set,
    useId,
    useName,
    useSelected,
    determineSelected,
    useIsHalted,
    useIsServerCompileEnabled,
    useIsProtectedEnvironment,
    useIsExpertModeEnabled,
    setAllEnvironments,
  };
}
