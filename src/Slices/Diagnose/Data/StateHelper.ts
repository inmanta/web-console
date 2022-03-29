import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class DiagnosticsStateHelper extends PrimaryStateHelper<"GetDiagnostics"> {
  constructor(store: Store) {
    super(
      store,
      (data, { id }) => {
        const value = RemoteData.mapSuccess((data) => {
          return {
            failures: data.data.failures,
            rejections: data.data.rejections.map((rejection) => {
              // The backend always returns maximum one error
              return {
                ...rejection,
                error:
                  rejection.errors.length > 0 ? rejection.errors[0] : undefined,
              };
            }),
          };
        }, data);
        store.dispatch.diagnostics.setData({ id, value });
      },
      (state, { id }) => state.diagnostics.byServiceInstanceId[id]
    );
  }
}
