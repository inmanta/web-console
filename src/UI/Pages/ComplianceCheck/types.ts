import { DryRun, RemoteData } from "@/Core";

export type RemoteReportId = RemoteData.RemoteData<never, string>;

export type RemoteReportList = RemoteData.RemoteData<string, DryRun[]>;

export type ProgressReport = Pick<DryRun, "todo" | "total">;
