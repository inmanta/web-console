import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"LatestReleasedResources">,
  Query.Data<"LatestReleasedResources">
>;

/**
 * The LatestReleasedResourcesSlice stores LatestReleasedResources.
 */
export interface LatestReleasedResourcesSlice {
  /**
   * Stores the full list of resources by their environment.
   */
  listByEnv: Record<string, Data>;
  /**
   * Sets a list of service names linked to an environment.
   * It also stores the services in the servicesByNameAndEnv record.
   */
  setList: Action<
    LatestReleasedResourcesSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const latestReleasedResourcesSlice: LatestReleasedResourcesSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
