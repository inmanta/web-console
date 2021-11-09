import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetEnvironmentsStateHelper extends PrimaryStateHelper<"GetEnvironments"> {
  constructor(store: Store) {
    super(
      store,
      (data) => {
        const unwrapped = RemoteData.mapSuccess((wrapped) => {
          return wrapped.data.flatMap((project) => [
            ...project.environments.map((environment) => ({
              ...environment,
              projectName: project.name,
            })),
          ]);
        }, data);
        store.dispatch.environments.setEnvironments(unwrapped);
      },
      (state) => state.environments.environments
    );
  }
}
