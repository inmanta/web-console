import { createTypedHooks } from "easy-peasy";
import { AppSlice, appSlice } from "./AppSlice";

export interface StoreModel {
  projects: AppSlice;
}

export const storeModel: StoreModel = {
  projects: appSlice,
};

const {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
} = createTypedHooks<StoreModel>();

export default {
  useStoreActions,
  useStoreDispatch,
  useStoreState,
};
