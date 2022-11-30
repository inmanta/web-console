import {
  EnvironmentDetails,
  EnvironmentModifier,
  EnvironmentSettings,
  Maybe,
  RemoteData,
} from "@/Core";
import { useStoreState } from "@/Data/Store";

export function EnvironmentModifierImpl(): EnvironmentModifier {
  let environment: Maybe.Type<string> = Maybe.none();

  function useCurrentEnvironment(): EnvironmentDetails | null {
    const storeState = useStoreState(
      (state) => state.environment.environmentDetailsById
    );
    if (Maybe.isSome(environment)) {
      const state = storeState[environment.value];
      if (state !== undefined && RemoteData.isSuccess(state)) {
        return state.value;
      }
    }

    return null;
  }

  function useEnvironmentSettings(): EnvironmentSettings.EnvironmentSettings | null {
    const storeState = useStoreState(
      (state) => state.environment.settingsByEnv
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
    settingName: keyof EnvironmentSettings.DefinitionMap
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
      return Boolean(environmentSettings.definition[settingName].default);
    }
  }

  function useIsServerCompileEnabled(): boolean {
    return useSetting("server_compile");
  }

  function useIsProtectedEnvironment(): boolean {
    return useSetting("protected_environment");
  }
  return {
    useIsHalted,
    setEnvironment,
    useIsServerCompileEnabled,
    useIsProtectedEnvironment,
  };
}
