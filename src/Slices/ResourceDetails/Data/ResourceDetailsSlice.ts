import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetResourceDetails">,
  Query.Data<"GetResourceDetails">
>;

/**
 * The ResourceDetailsSlice stores the details of a resource by id.
 */
export interface ResourceDetailsSlice {
  /**
   * Stores the full list of resources by their environment.
   */
  byId: Record<string, Data>;
  /**
   * Sets the resources in the listByEnv record.
   */
  setData: Action<
    ResourceDetailsSlice,
    {
      id: string;
      value: Data;
    }
  >;
}

export const resourceDetailsSlice: ResourceDetailsSlice = {
  byId: {},
  setData: action(({ byId }, { id, value }) => {
    byId[id] = value;
  }),
};
