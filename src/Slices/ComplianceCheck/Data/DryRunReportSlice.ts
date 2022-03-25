import { Action, action } from "easy-peasy";
import { RemoteData } from "@/Core";
import { Report } from "@S/ComplianceCheck/Core/Domain";

export interface DryRunReportSlice {
  byId: Record<string, RemoteData.RemoteData<string, Report>>;
  set: Action<
    DryRunReportSlice,
    {
      reportId: string;
      data: RemoteData.RemoteData<string, Report>;
    }
  >;
}

export const dryRunReportSlice: DryRunReportSlice = {
  byId: {},
  set: action((state, { reportId, data }) => {
    state.byId[reportId] = data;
  }),
};
