import { Action, action } from "easy-peasy";
import { FlatEnvironment, Query, RemoteData } from "@/Core";

type EnvironmentSettingsData = RemoteData.Type<
  Query.Error<"GetEnvironmentSettings">,
  Query.Data<"GetEnvironmentSettings">
>;

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
  environmentMetricsById: Record<
    string,
    RemoteData.Type<Query.Error<"GetMetrics">, Query.Data<"GetMetrics">>
  >;
  setEnvironmentMetricsById: Action<
    EnvironmentSlice,
    {
      id: string;
      value: RemoteData.Type<
        Query.Error<"GetMetrics">,
        Query.Data<"GetMetrics">
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
  settingsByEnv: Record<string, EnvironmentSettingsData>;
  setSettingsData: Action<
    EnvironmentSlice,
    {
      environment: string;
      value: EnvironmentSettingsData;
      merge?: boolean;
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
  environmentMetricsById: {},
  setEnvironmentMetricsById: action((state, payload) => {
    state.environmentMetricsById[payload.id] = payload.value;
  }),
  environmentDetailsWithIconById: {},
  setEnvironmentDetailsWithIconById: action((state, payload) => {
    state.environmentDetailsWithIconById[payload.id] = payload.value;
  }),
  settingsByEnv: {},
  setSettingsData: action((state, { environment, value, merge }) => {
    state.settingsByEnv[environment] = merge
      ? mergeData(state.settingsByEnv[environment], value)
      : value;
  }),
};

function mergeData(
  prev: EnvironmentSettingsData,
  next: EnvironmentSettingsData,
): EnvironmentSettingsData {
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
