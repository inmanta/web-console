import { Action, action } from "easy-peasy";
import { FlatEnvironment, RemoteData } from "@/Core";

export interface EnvironmentsSlice {
  allEnvironments: RemoteData.Type<string, FlatEnvironment[]>;
  setAllEnvironments: Action<
    EnvironmentsSlice,
    RemoteData.Type<string, FlatEnvironment[]>
  >;
}

export const environmentsSlice: EnvironmentsSlice = {
  allEnvironments: RemoteData.notAsked(),
  setAllEnvironments: action((state, payload) => {
    state.allEnvironments = payload;
  }),
};
