import { Action, action } from "easy-peasy";
import { FlatEnvironment, Query, RemoteData } from "@/Core";

export interface EnvironmentSlice {
  environments: RemoteData.Type<string, FlatEnvironment[]>;
  setEnvironments: Action<
    EnvironmentSlice,
    RemoteData.Type<string, FlatEnvironment[]>
  >;
  environmentsWithDetails: RemoteData.Type<string, FlatEnvironment[]>;
  setEnvironmentsWithDetails: Action<
    EnvironmentSlice,
    RemoteData.Type<string, FlatEnvironment[]>
  >;
  environmentDetailsById: Record<
    string,
    RemoteData.Type<
      Query.Error<"GetEnvironmentDetails">,
      Query.Data<"GetEnvironmentDetails">
    >
  >;
  setEnvironmentDetailsById: Action<
    EnvironmentSlice,
    {
      id: string;
      value: RemoteData.Type<
        Query.Error<"GetEnvironmentDetails">,
        Query.Data<"GetEnvironmentDetails">
      >;
    }
  >;
  environmentDetailsWithIconById: Record<
    string,
    RemoteData.Type<
      Query.Error<"GetEnvironmentDetails">,
      Query.Data<"GetEnvironmentDetails">
    >
  >;
  setEnvironmentDetailsWithIconById: Action<
    EnvironmentSlice,
    {
      id: string;
      value: RemoteData.Type<
        Query.Error<"GetEnvironmentDetails">,
        Query.Data<"GetEnvironmentDetails">
      >;
    }
  >;
}

export const environmentSlice: EnvironmentSlice = {
  environments: RemoteData.notAsked(),
  setEnvironments: action((state, payload) => {
    state.environments = payload;
  }),
  environmentsWithDetails: RemoteData.notAsked(),
  setEnvironmentsWithDetails: action((state, payload) => {
    state.environmentsWithDetails = payload;
  }),
  environmentDetailsById: {},
  setEnvironmentDetailsById: action((state, payload) => {
    state.environmentDetailsById[payload.id] = payload.value;
  }),
  environmentDetailsWithIconById: {},
  setEnvironmentDetailsWithIconById: action((state, payload) => {
    state.environmentDetailsWithIconById[payload.id] = payload.value;
  }),
};
