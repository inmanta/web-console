import { ServiceInstanceModel, ServiceInstanceIdentifier } from "@/Core/Domain";

export interface GetServiceInstance extends ServiceInstanceIdentifier {
  kind: "GetServiceInstance";
}

export interface GetServiceInstanceManifest {
  error: string;
  apiResponse: { data: ServiceInstanceModel };
  data: ServiceInstanceModel;
  usedData: ServiceInstanceModel;
  query: GetServiceInstance;
}
