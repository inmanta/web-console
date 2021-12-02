import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper, AgentProcess } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<string, AgentProcess>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"GetAgentProcess">>;

export class AgentProcessStateHelper implements StateHelper<"GetAgentProcess"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, { id }: Query.SubQuery<"GetAgentProcess">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.agentProcess.setData({ id, value });
  }

  getHooked({ id }: Query.SubQuery<"GetAgentProcess">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.agentProcess.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.SubQuery<"GetAgentProcess">): Data {
    return this.enforce(this.store.getState().agentProcess.byId[id]);
  }
}
