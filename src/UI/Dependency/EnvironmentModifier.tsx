import { EnvironmentModifier, Maybe, RemoteData } from "@/Core";
import { useStoreState } from "@/Data";

export class EnvironmentModifierImpl implements EnvironmentModifier {
  private environment: Maybe.Type<string> = Maybe.none();
  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  useIsHalted(): boolean {
    const storeState = useStoreState((state) => state.environmentDetails.byEnv);
    if (Maybe.isSome(this.environment)) {
      const state = storeState[this.environment.value];
      if (RemoteData.isSuccess(state)) {
        return state.value.halted;
      }
    }

    return false;
  }
}
