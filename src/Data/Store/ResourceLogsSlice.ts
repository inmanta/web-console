import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetResourceLogs">,
  Query.Data<"GetResourceLogs">
>;

export interface ResourceLogsSlice {
  byId: Record<string, Data>;
  setData: Action<
    ResourceLogsSlice,
    {
      id: string;
      value: Data;
    }
  >;
}

export const resourceLogsSlice: ResourceLogsSlice = {
  byId: {},
  setData: action(({ byId }, { id, value }) => {
    byId[id] = value;
  }),
};
