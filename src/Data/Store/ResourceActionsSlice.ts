import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"ResourceActions">,
  Query.Data<"ResourceActions">
>;

export interface ResourceActionsSlice {
  byId: Record<string, Data>;
  setData: Action<
    ResourceActionsSlice,
    {
      id: string;
      value: Data;
    }
  >;
}

export const resourceActionsSlice: ResourceActionsSlice = {
  byId: {},
  setData: action(({ byId }, { id, value }) => {
    byId[id] = value;
  }),
};
