import { ServiceInstanceIdentifier } from "@/Core/Domain";
import { Diagnostics, RawDiagnostics } from "./Domain";

/** Diagnostics describe the status of an instance with regards to the diagnose call */
export interface Query extends ServiceInstanceIdentifier {
  kind: "GetDiagnostics";
}

export interface Manifest {
  error: string;
  apiResponse: { data: RawDiagnostics };
  data: Diagnostics;
  usedData: Diagnostics;
  query: Query;
}
