import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"GetProjects">,
  Query.Data<"GetProjects">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetProjects">,
  Query.ApiResponse<"GetProjects">
>;

export class ProjectsStateHelper implements StateHelper<"GetProjects"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.projects.setAllProjects(unwrapped);
  }

  getHooked(): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
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
