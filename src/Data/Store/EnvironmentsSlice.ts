import { Action, action } from "easy-peasy";
import { FlatEnvironment, RemoteData } from "@/Core";

export interface EnvironmentsSlice {
  environments: RemoteData.Type<string, FlatEnvironment[]>;
  setEnvironments: Action<
    EnvironmentsSlice,
    RemoteData.Type<string, FlatEnvironment[]>
  >;
}

export const environmentsSlice: EnvironmentsSlice = {
  environments: RemoteData.notAsked(),
  setEnvironments: action((state, payload) => {
    state.environments = payload;
  }),
};
