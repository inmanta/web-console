import { EnvironmentModifier, Maybe, RemoteData } from "@/Core";
import { useStoreState } from "@/Data";

export class EnvironmentModifierImpl implements EnvironmentModifier {
  private environment: Maybe.Type<string> = Maybe.none();
  setEnvironment(environment: string): void {
    this.environment = Maybe.some(environment);
  }

  isHalted(): boolean {
    if (Maybe.isSome(this.environment)) {
      const state = useStoreState((state) => state.environmentDetails.byEnv)[
        this.environment.value
      ];
      if (RemoteData.isSuccess(state)) {
        return state.value.halted;
      }
    }

    return false;
  }
}
