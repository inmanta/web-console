import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetResourceHistory">,
  Query.Data<"GetResourceHistory">
>;

/**
 * The ResourceHistorySlice stores the history of a resource by id.
 */
export interface ResourceHistorySlice {
  /**
   * Stores the full list of resources by their environment.
   */
  byId: Record<string, Data>;
  /**
   * Sets the resources in the listByEnv record.
   */
  setData: Action<
    ResourceHistorySlice,
    {
      id: string;
      value: Data;
    }
  >;
}

export const resourceHistorySlice: ResourceHistorySlice = {
  byId: {},
  setData: action(({ byId }, { id, value }) => {
    byId[id] = value;
  }),
};
