import { Maybe, RemoteData } from "@/Core";
import { DryRun } from "@S/ComplianceCheck/Core/Domain";

export type RemoteReportList = RemoteData.RemoteData<string, DryRun[]>;

export type MaybeReport = Maybe.Maybe<DryRun>;
