import {
  createStore,
  Action,
  action,
  Store as _Store,
  createTypedHooks,
} from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import { DataModel } from "./Interfaces";

export interface StoreModel {
  data: Record<string, RemoteData.Type<string, DataModel>>;
  setData: Action<
    StoreModel,
    { id: string; value: Either.Type<string, DataModel> }
  >;
}

export const storeModel: StoreModel = {
  data: {},
  setData: action((state, payload) => {
    state.data[payload.id] = RemoteData.fromEither(payload.value);
  }),
};

export const storeInstance = createStore<StoreModel>(storeModel);

export type Store = _Store<StoreModel>;

export const {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
} = createTypedHooks<StoreModel>();
