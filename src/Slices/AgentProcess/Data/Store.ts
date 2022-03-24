import { Action, action } from "easy-peasy";
import { RemoteData } from "@/Core";
import { AgentProcess } from "@/Slices/AgentProcess/Core/Model";

export interface AgentProcessSlice {
  byId: Record<string, RemoteData.Type<string, AgentProcess>>;
  setData: Action<
    AgentProcessSlice,
    { id: string; value: RemoteData.Type<string, AgentProcess> }
  >;
}

export const agentProcessSlice: AgentProcessSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
