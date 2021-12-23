import { RemoteData, Resource } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data";
import { Store } from "@/Data/Store";

export class ResourcesStateHelper extends PrimaryStateHelperWithEnv<"GetResources"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => ({
            ...wrapped,
            data: wrapped.data.map((resource) => ({
              ...resource,
              status: resource.status as Resource.Status,
            })),
          }),
          data
        );
        store.dispatch.resources.setList({
          environment,
          data: unwrapped,
        });
      },
      (state, query, environment) => state.resources.listByEnv[environment]
    );
  }
}
