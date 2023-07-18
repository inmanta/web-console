import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";
import { InstanceWithReferences } from "./interface";

export function GetInstanceWithRelationsStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetInstanceWithRelations">(
    store,
    (data, query) => {
      //stateHelper implementation interfaces want to get direct api response which is different what data looks like after getting relations through concurrency,
      //decided to set is a any to avoid having separate implementation just for this call
      const value = RemoteData.mapSuccess(
        (wrapped) => wrapped as unknown as InstanceWithReferences,
        data
      );
      store.dispatch.serviceInstanceWithRelations.setData({
        id: query.id,
        value,
      });
    },
    (state, query) => {
      return state.serviceInstanceWithRelations.byId[query.id];
    }
  );
}
