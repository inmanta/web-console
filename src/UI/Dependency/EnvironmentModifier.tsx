import { useState } from "react";
import { FlatEnvironment, EnvironmentModifier, EnvironmentSettings } from "@/Core";

export function EnvironmentModifierImpl(): EnvironmentModifier {
  const [env, setEnv] = useState<FlatEnvironment | null>(null);
  const [envSettings, setEnvSettings] = useState<EnvironmentSettings.EnvironmentSettings | null>(
    null
  );

  function setEnvironment(environmentToSet: FlatEnvironment): void {
    setEnv(environmentToSet);
  }

  function setEnvironmentSettings(
    environmentSettingsToSet: EnvironmentSettings.EnvironmentSettings
  ): void {
    setEnvSettings(environmentSettingsToSet);
  }

  function useIsHalted(): boolean {
    if (env === null) return false;

    return env.halted;
  }

  function useSetting(settingName: keyof EnvironmentSettings.DefinitionMap): boolean {
    if (env === null || envSettings === null) return false;

    if (env.settings[settingName] !== undefined && env.settings[settingName] !== null) {
      return Boolean(env.settings[settingName]);
    } else {
      return Boolean(envSettings.definition[settingName]?.default);
    }
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
    setEnvironmentSettings,
    useIsServerCompileEnabled,
    useIsProtectedEnvironment,
    useIsExpertModeEnabled,
  };
}
