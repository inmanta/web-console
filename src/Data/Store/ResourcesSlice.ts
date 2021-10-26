import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetResources">,
  Query.Data<"GetResources">
>;

/**
 * The ResourcesSlice stores Resources.
 */
export interface ResourcesSlice {
  /**
   * Stores the full list of resources by their environment.
   */
  listByEnv: Record<string, Data>;
  /**
   * Sets the resources in the listByEnv record.
   */
  setList: Action<
    ResourcesSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const resourcesSlice: ResourcesSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
