import {
  EnvironmentDetails,
  EnvironmentModifier,
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

  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  useIsHalted(): boolean {
    const environmentDetails = this.useCurrentEnvironment();
    if (environmentDetails === null) return false;
    return environmentDetails.halted;
  }

  useIsServerCompileEnabled(): boolean {
    const environmentDetails = this.useCurrentEnvironment();
    if (environmentDetails === null) return false;
    return Boolean(environmentDetails.settings.server_compile);
  }
}
