import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetVersionResources">,
  Query.Data<"GetVersionResources">
>;

export interface VersionResourcesSlice {
  byEnv: Record<string, Data>;
  set: Action<
    VersionResourcesSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const versionResourcesSlice: VersionResourcesSlice = {
  byEnv: {},
  set: action((state, { environment, data }) => {
    state.byEnv[environment] = data;
  }),
};
