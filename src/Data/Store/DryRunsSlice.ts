import { Action, action } from "easy-peasy";
import { DryRun, RemoteData } from "@/Core";

export interface DryRunsSlice {
  listByEnvAndVersion: Record<
    string,
    Record<string, RemoteData.Type<string, DryRun.Model[]>>
  >;
  setList: Action<
    DryRunsSlice,
    {
      environment: string;
      version: number;
      data: RemoteData.Type<string, DryRun.Model[]>;
    }
  >;
}

export const dryRunsSlice: DryRunsSlice = {
  listByEnvAndVersion: {},
  setList: action((state, { environment, version, data }) => {
    state.listByEnvAndVersion[environment] = {
      ...(state.listByEnvAndVersion[environment] === undefined
        ? {}
        : state[environment]),
      [version]: data,
    };
  }),
};
