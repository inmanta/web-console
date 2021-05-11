import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<Query.Error<"Projects">, Query.Data<"Projects">>;
type ApiData = RemoteData.Type<
  Query.Error<"Projects">,
  Query.ApiResponse<"Projects">
>;

export class ProjectsStateHelper implements StateHelper<"Projects"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.projects.setAllProjects(unwrapped);
  }

  getHooked(): Data {
    return useStoreState(
      (state) => this.enforce(state.projects.allProjects),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(): Data {
    return this.enforce(this.store.getState().projects.allProjects);
  }
}
