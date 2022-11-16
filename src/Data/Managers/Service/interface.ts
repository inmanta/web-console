import { ServiceIdentifier, ServiceModel } from "@/Core/Domain";

/**
 * The ServiceQuery identifies 1 specific service.
 */
export interface GetService extends ServiceIdentifier {
  kind: "GetService";
}

export interface GetServiceManifest {
  error: string;
  apiResponse: { data: ServiceModel };
  data: ServiceModel;
  usedData: ServiceModel;
  query: GetService;
}
