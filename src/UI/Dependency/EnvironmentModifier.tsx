import { useState } from "react";
import { FlatEnvironment, EnvironmentModifier, EnvironmentSettings } from "@/Core";
import { useGetEnvironmentSettings } from "@/Data/Managers/V2/Environment";

/**
 * EnvironmentModifierImpl is a function that returns an object with the following properties:
 *
 * - useIsHalted: a hook that returns a boolean value indicating if the environment is halted
 * - setEnvironment: a function that sets the environment
 * - setEnvironmentSettings: a function that sets the environment settings
 * - useIsServerCompileEnabled: a hook that returns a boolean value indicating if the server compile is enabled
 * - useIsProtectedEnvironment: a hook that returns a boolean value indicating if the environment is protected
 * - useIsExpertModeEnabled: a hook that returns a boolean value indicating if the expert mode is enabled
 *
 * @returns {EnvironmentModifier} - An object with the following properties:
 */
export function useEnvironmentModifierImpl(): EnvironmentModifier {
  const [env, setEnv] = useState<FlatEnvironment | null>(null);
  const envSettings = useGetEnvironmentSettings(env?.id).useOneTime();

  function setEnvironment(environmentToSet: FlatEnvironment): void {
    setEnv((prev) => {
      if (prev?.id === environmentToSet.id) {
        envSettings.refetch();
      }
      return environmentToSet;
    });
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
    if (envSettings.data) {
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

  return {
    useIsHalted,
    setEnvironment,
    useIsServerCompileEnabled,
    useIsProtectedEnvironment,
    useIsExpertModeEnabled,
  };
}
