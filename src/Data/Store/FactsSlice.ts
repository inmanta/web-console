import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<Query.Error<"GetFacts">, Query.Data<"GetFacts">>;

export interface FactsSlice {
  listByResource: Record<string, Data>;
  setList: Action<
    FactsSlice,
    {
      resourceId: string;
      data: Data;
    }
  >;
}

export const factsSlice: FactsSlice = {
  listByResource: {},
  setList: action(({ listByResource }, { resourceId, data }) => {
    listByResource[resourceId] = data;
  }),
};
