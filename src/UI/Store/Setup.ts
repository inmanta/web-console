import { createStore, createTypedHooks, Store as _Store } from "easy-peasy";
import { StoreModel, storeModel } from "@/UI/Store/Store";

export const { useStoreActions, useStoreState, useStoreDispatch, useStore } =
  createTypedHooks<StoreModel>();

export type Store = _Store<StoreModel>;

export const getStoreInstance = (): Store =>
  createStore<StoreModel>(storeModel);
