import {
  createStore,
  createTypedHooks,
  Store as _Store,
  State as _State,
  Dispatch as _Dispatch,
} from "easy-peasy";
import { StoreModel, storeModel } from "./Store";

export const { useStoreActions, useStoreState, useStoreDispatch, useStore } =
  createTypedHooks<StoreModel>();

export type Store = _Store<StoreModel>;
export type State = _State<StoreModel>;
export type Dispatch = _Dispatch<StoreModel>;

export const getStoreInstance = (): Store =>
  createStore<StoreModel>(storeModel);
