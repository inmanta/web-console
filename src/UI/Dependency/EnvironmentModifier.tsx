import {
  EnvironmentDetails,
  EnvironmentModifier,
  EnvironmentSettings,
  Maybe,
  RemoteData,
} from "@/Core";
import { useStoreState } from "@/Data/Store";

export class EnvironmentModifierImpl implements EnvironmentModifier {
  private environment: Maybe.Type<string> = Maybe.none();

  private useCurrentEnvironment(): EnvironmentDetails | null {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const storeState = useStoreState(
      (state) => state.environment.environmentDetailsById
    );
    if (Maybe.isSome(this.environment)) {
      const state = storeState[this.environment.value];
      if (state !== undefined && RemoteData.isSuccess(state)) {
        return state.value;
      }
    }

    return null;
  }

  private useEnvironmentSettings(): EnvironmentSettings.EnvironmentSettings | null {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    const storeState = useStoreState(
      (state) => state.environment.settingsByEnv
    );
    if (Maybe.isSome(this.environment)) {
      const state = storeState[this.environment.value];
      if (state !== undefined && RemoteData.isSuccess(state)) {
        return state.value;
      }
    }
    return null;
  }

  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  useIsHalted(): boolean {
    const environmentDetails = this.useCurrentEnvironment();
    if (environmentDetails === null) return false;
    return environmentDetails.halted;
  }

  private useSetting(
    settingName: keyof EnvironmentSettings.DefinitionMap
  ): boolean {
    const environmentDetails = this.useCurrentEnvironment();
    const environmentSettings = this.useEnvironmentSettings();
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

  useIsServerCompileEnabled(): boolean {
    return this.useSetting("server_compile");
  }

  useIsProtectedEnvironment(): boolean {
    return this.useSetting("protected_environment");
  }
}
