import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class StateHelper extends PrimaryStateHelper<"GetProjects"> {
  constructor(store: Store) {
    super(
      store,
      (data) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.projects.setProjects(unwrapped);
      },
      (state) => state.projects.projects
    );
  }
}
