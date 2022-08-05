import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<Query.Error<"GetAgents">, Query.Data<"GetAgents">>;

export interface AgentsSlice {
  listByEnv: Record<string, Data>;
  setList: Action<
    AgentsSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const agentsSlice: AgentsSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
