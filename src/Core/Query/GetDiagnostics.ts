import {
  ServiceInstanceIdentifier,
  RawDiagnostics,
  Diagnostics,
} from "@/Core/Domain";

/** Diagnostics describe the status of an instance with regards to the diagnose call */
export interface GetDiagnostics extends ServiceInstanceIdentifier {
  kind: "GetDiagnostics";
}

export interface GetDiagnosticsManifest {
  error: string;
  apiResponse: { data: RawDiagnostics };
  data: Diagnostics;
  usedData: Diagnostics;
  query: GetDiagnostics;
}
