import {
  EnvironmentDetails,
  EnvironmentModifier,
  EnvironmentSettings,
} from "@/Core";
import { EnvironmentSettings as EnvironmentSettingsType } from "@/Core/Domain/EnvironmentSettings";
import { useGetEnvironmentDetails } from "@/Data/Managers/V2/Environment/GetEnvironmentDetails";
import { useGetEnvironmentSettings } from "@/Data/Managers/V2/Environment/GetEnvironmentSettings";
import { useState } from "react";

export function EnvironmentModifierImpl(): EnvironmentModifier {
  const [envId, setEnvId] = useState<null | string>(null);

  const envDetails = useGetEnvironmentDetails().useContinuous(envId || "");
  const envSettings = useGetEnvironmentSettings().useOneTime(envId || "");

  function useCurrentEnvironment(): EnvironmentDetails | null {
    if (envId) {
      if (envDetails.isSuccess) {
        return envDetails.data;
      }
    }

    return null;
  }

  function useEnvironmentSettings(): EnvironmentSettingsType | null {
    if (envId) {
      if (envSettings.isSuccess) {
        return envSettings.data;
      }
    }

    return null;
  }

  function setEnvironment(environmentToSet: string): void {
    setEnvId(environmentToSet);
  }

  function useIsHalted(): boolean {
    const environmentDetails = useCurrentEnvironment();

    if (environmentDetails === null) return false;

    return environmentDetails.halted;
  }

  function useSetting(
    settingName: keyof EnvironmentSettings.DefinitionMap,
  ): boolean {
    const environmentDetails = useCurrentEnvironment();
    const environmentSettings = useEnvironmentSettings();

    if (environmentDetails === null || environmentSettings === null)
      return false;
    if (
      environmentDetails.settings[settingName] !== undefined &&
      environmentDetails.settings[settingName] !== null
    ) {
      return Boolean(environmentDetails.settings[settingName]);
    } else {
      return Boolean(environmentSettings.definition[settingName]?.default);
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
    useIsServerCompileEnabled,
    useIsProtectedEnvironment,
    useIsExpertModeEnabled,
  };
}
