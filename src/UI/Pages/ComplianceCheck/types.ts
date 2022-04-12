import { DryRun, Maybe, RemoteData } from "@/Core";

export type RemoteReportList = RemoteData.RemoteData<string, DryRun.Model[]>;

export type MaybeReport = Maybe.Maybe<DryRun.Model>;
