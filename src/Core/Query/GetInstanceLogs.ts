import { InstanceLog, ServiceInstanceIdentifier } from "@/Core/Domain";

/**
 * The instanceLogs query describes logs belonging to one specific service instance
 */
export interface GetInstanceLogs extends ServiceInstanceIdentifier {
  kind: "GetInstanceLogs";
}

export interface GetInstanceLogsManifest {
  error: string;
  apiResponse: { data: InstanceLog[] };
  data: InstanceLog[];
  usedData: InstanceLog[];
  query: GetInstanceLogs;
}
