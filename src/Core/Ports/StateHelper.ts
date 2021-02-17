import { RemoteData } from "@/Core/Language";

/**
 * The StateHelper is responsible for getting and setting state.
 * This doesn't own any data because we keep the data in a redux
 * store instance. This allows us to use the redux-react bindings
 * under the hood.
 *
 * We need 2 getters, getOnce & getHooked.
 *
 * getHooked is based on React Hooks. This can only be used in a
 * top-level component context. It retriggers when there is
 * a change to the store. We can provide an equality function to
 * prevent unnecessary rerenders. Standard equality comparison uses
 * reference equality. When the API returns data, we create new
 * objects causing new references. So we need a custom equality
 * function to do a deep comparison and prevent rerenders.
 *
 * getOnce is a regular function. This can be used in any function
 * without a component context. We use it in the effect callback to
 * initialise data.
 */
export interface StateHelper<Error, Data> {
  set(id: string, value: RemoteData.Type<Error, Data>): void;
  getOnce(id: string): RemoteData.Type<Error, Data>;
  getHooked(id: string): RemoteData.Type<Error, Data>;
}
