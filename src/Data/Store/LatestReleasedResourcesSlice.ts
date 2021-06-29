import { Action, action } from "easy-peasy";
import { RemoteData, LatestReleasedResource } from "@/Core";

/**
 * The LatestReleasedResourcesSlice stores LatestReleasedResources.
 */
export interface LatestReleasedResourcesSlice {
  /**
   * Stores the full list of resources by their environment.
   */
  listByEnv: Record<string, RemoteData.Type<string, LatestReleasedResource[]>>;
  /**
   * Sets a list of service names linked to an environment.
   * It also stores the services in the servicesByNameAndEnv record.
   */
  setList: Action<
    LatestReleasedResourcesSlice,
    {
      environment: string;
      data: RemoteData.Type<string, LatestReleasedResource[]>;
    }
  >;
}

export const latestReleasedResourcesSlice: LatestReleasedResourcesSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
