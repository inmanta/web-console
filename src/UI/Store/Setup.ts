import { createTypedHooks } from "easy-peasy";
import { ResourceFetcher } from "@/Core";
import { ResourceFetcherImpl } from "@/Infra";
import { StoreModel } from "./Store";

export const {
  useStoreActions,
  useStoreState,
  useStoreDispatch,
} = createTypedHooks<StoreModel>();

export interface Injections {
  resourceFetcher: ResourceFetcher;
}

export const injections: Injections = {
  resourceFetcher: new ResourceFetcherImpl(undefined),
};
