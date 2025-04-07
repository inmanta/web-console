import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<Query.Error<"GetFacts">, Query.Data<"GetFacts">>;

export interface FactsSlice {
  listByEnv: Record<string, Data>;
  setList: Action<
    FactsSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const factsSlice: FactsSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
