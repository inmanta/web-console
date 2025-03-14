import {
  EnvironmentDetails,
  EnvironmentModifier,
  EnvironmentSettings,
  FlatEnvironment,
  Maybe,
  RemoteData,
} from "@/Core";
import { useGetEnvironmentDetails } from "@/Data/Managers/V2/Environment/GetEnvironmentDetails";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment/GetEnvironments";
import { useGetEnvironmentSettings } from "@/Data/Managers/V2/Environment/GetEnvironmentSettings";
import { useStoreState } from "@/Data/Store";
import { useState } from "react";

export function EnvironmentModifierImpl(): EnvironmentModifier {
  const [envId, setEnvId] = useState<null | string>(null);

  const allEnvironments = useGetEnvironments().useContinuous();
  const envDetails = useGetEnvironmentDetails().useContinuous(envId);
  const envSettings = useGetEnvironmentSettings().useOneTime(envId);

  function useCurrentEnvironment(): EnvironmentDetails | null {
    const storeState = useStoreState(
      (state) => state.environment.environmentDetailsById,
    );

    if (Maybe.isSome(environment)) {
      const state = storeState[environment.value];

      if (state !== undefined && RemoteData.isSuccess(state)) {
        return state.value;
      }
    }

    return null;
  }

  function setEnvironment(environmentToSet: string): void {
    environment = Maybe.some(environmentToSet);
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
