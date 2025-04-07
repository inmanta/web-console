import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetDiscoveredResources">,
  Query.Data<"GetDiscoveredResources">
>;

export interface DiscoveredResourcesSlice {
  listByEnv: Record<string, Data>;
  setList: Action<
    DiscoveredResourcesSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const discoveredResourcesSlice: DiscoveredResourcesSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
