import { Action, action } from "easy-peasy";
import { Config, RemoteData } from "@/Core";

export interface ServiceConfigSlice {
  byName: Record<string, RemoteData.Type<string, Config>>;
  setData: Action<
    ServiceConfigSlice,
    { name: string; value: RemoteData.Type<string, Config> }
  >;
}

export const serviceConfigSlice: ServiceConfigSlice = {
  byName: {},
  setData: action((state, { name, value }) => {
    state.byName[name] = value;
  }),
};
