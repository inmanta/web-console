import { ServiceInstanceIdentifier } from "@/Core/Domain";
import { InstanceLog } from "./Domain";

/**
 * The instanceLogs query describes logs belonging to one specific service instance
 */
export interface Query extends ServiceInstanceIdentifier {
  kind: "GetInstanceLogs";
}

export interface Manifest {
  error: string;
  apiResponse: { data: InstanceLog[] };
  data: InstanceLog[];
  usedData: InstanceLog[];
  query: Query;
}
