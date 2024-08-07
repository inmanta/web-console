import { RemoteData, Resource } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function StateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetResources">(
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
        data,
      );

      store.dispatch.resources.setList({
        environment,
        data: unwrapped,
      });
    },
    (state, query, environment) => state.resources.listByEnv[environment],
  );
}
