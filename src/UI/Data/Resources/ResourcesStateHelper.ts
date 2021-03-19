import { Query, RemoteData, ResourceModel, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, ResourceModel[]>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"Resources">>;

export class ResourcesStateHelper implements StateHelper<"Resources"> {
  constructor(private readonly store: Store) {}

  set(qualifier: Query.Qualifier<"Resources">, data: ApiData): void {
    const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.resources.setData({ id: qualifier.id, value });
  }

  getHooked(qualifier: Query.Qualifier<"Resources">): Data {
    return useStoreState((state) => {
      return this.enforce(state.resources.byId[qualifier.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(qualifier: Query.Qualifier<"Resources">): Data {
    return this.enforce(this.store.getState().resources.byId[qualifier.id]);
  }
}
