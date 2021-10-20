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
    { environment: string; value: Data }
  >;
}

export const environmentSettingsSlice: EnvironmentSettingsSlice = {
  byEnv: {},
  setData: action((state, { environment, value }) => {
    state.byEnv[environment] = value;
  }),
};
