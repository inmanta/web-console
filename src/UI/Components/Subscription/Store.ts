import {
  createStore,
  Action,
  action,
  Store as _Store,
  createTypedHooks,
} from "easy-peasy";
import { RemoteData } from "@/Core";
import { DataModel } from "./DataModel";

export interface StoreModel {
  data: Record<string, RemoteData.Type<string, DataModel>>;
  setData: Action<
    StoreModel,
    { id: string; value: RemoteData.Type<string, DataModel> }
  >;
}

export const storeModel: StoreModel = {
  data: {},
  setData: action((state, payload) => {
    state.data[payload.id] = payload.value;
  }),
};

export const getStoreInstance = (): Store =>
  createStore<StoreModel>(storeModel);

export type Store = _Store<StoreModel>;

export const {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
} = createTypedHooks<StoreModel>();
