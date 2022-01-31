import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetResourceFacts">,
  Query.Data<"GetResourceFacts">
>;

export interface ResourceFactsSlice {
  listByResource: Record<string, Data>;
  setList: Action<
    ResourceFactsSlice,
    {
      resourceId: string;
      data: Data;
    }
  >;
}

export const resourceFactsSlice: ResourceFactsSlice = {
  listByResource: {},
  setList: action(({ listByResource }, { resourceId, data }) => {
    listByResource[resourceId] = data;
  }),
};
