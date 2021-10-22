import { Action, action } from "easy-peasy";
import { Query, RemoteData } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironmentSettings">,
  Query.Data<"GetEnvironmentSettings">
>;

export interface EnvironmentSettingsSlice {
  byEnv: Record<string, Data>;
  setData: Action<
    EnvironmentSettingsSlice,
    { environment: string; value: Data; merge?: boolean }
  >;
}

export const environmentSettingsSlice: EnvironmentSettingsSlice = {
  byEnv: {},
  setData: action((state, { environment, value, merge }) => {
    state.byEnv[environment] = merge
      ? mergeData(state.byEnv[environment], value)
      : value;
  }),
};

function mergeData(prev: Data, next: Data): Data {
  if (RemoteData.isSuccess(prev) && RemoteData.isSuccess(next)) {
    return RemoteData.success({
      settings: {
        ...prev.value.settings,
        ...next.value.settings,
      },
      definition: next.value.definition,
    });
  }

  return next;
}
