import { Action, action } from "easy-peasy";
import { Query, RemoteData } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironmentDetails">,
  Query.Data<"GetEnvironmentDetails">
>;

/**
 * The EnvironmentDetailsSlice stores the full details of an environment.
 * So 'byEnv' means by environment id.
 */
export interface EnvironmentDetailsSlice {
  byEnv: Record<string, Data>;
  setData: Action<EnvironmentDetailsSlice, { id: string; value: Data }>;
}

export const environmentDetailsSlice: EnvironmentDetailsSlice = {
  byEnv: {},
  setData: action((state, payload) => {
    state.byEnv[payload.id] = payload.value;
  }),
};
