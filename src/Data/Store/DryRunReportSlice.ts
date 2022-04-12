import { Action, action } from "easy-peasy";
import { DryRun, RemoteData } from "@/Core";

export interface DryRunReportSlice {
  byId: Record<string, RemoteData.RemoteData<string, DryRun.Report>>;
  set: Action<
    DryRunReportSlice,
    {
      reportId: string;
      data: RemoteData.RemoteData<string, DryRun.Report>;
    }
  >;
}

export const dryRunReportSlice: DryRunReportSlice = {
  byId: {},
  set: action((state, { reportId, data }) => {
    state.byId[reportId] = data;
  }),
};
