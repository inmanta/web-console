import { Action, action } from "easy-peasy";
import { FlatEnvironment, RemoteData } from "@/Core";

export interface EnvironmentsWithDetailsSlice {
  environments: RemoteData.Type<string, FlatEnvironment[]>;
  setEnvironments: Action<
    EnvironmentsWithDetailsSlice,
    RemoteData.Type<string, FlatEnvironment[]>
  >;
}

export const environmentsWithDetailsSlice: EnvironmentsWithDetailsSlice = {
  environments: RemoteData.notAsked(),
  setEnvironments: action((state, payload) => {
    state.environments = payload;
  }),
};
