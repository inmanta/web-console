import { Action, action } from "easy-peasy";
import { RemoteData } from "@/Core";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";

export interface DryRunsSlice {
  listByEnvAndVersion: Record<
    string,
    Record<string, RemoteData.Type<string, DryRun[]>>
  >;
  setList: Action<
    DryRunsSlice,
    {
      environment: string;
      version: number;
      data: RemoteData.Type<string, DryRun[]>;
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
