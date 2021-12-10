import { Action, action } from "easy-peasy";
import { Query, RemoteData } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironmentDetails">,
  Query.Data<"GetEnvironmentDetails">
>;

/**
 * The EnvironmentDetailsWithIconSlice stores the full details of an environment,
 * including icon and description.
 */
export interface EnvironmentDetailsWithIconSlice {
  byEnv: Record<string, Data>;
  setData: Action<EnvironmentDetailsWithIconSlice, { id: string; value: Data }>;
}

export const environmentDetailsWithIconSlice: EnvironmentDetailsWithIconSlice =
  {
    byEnv: {},
    setData: action((state, payload) => {
      state.byEnv[payload.id] = payload.value;
    }),
  };
