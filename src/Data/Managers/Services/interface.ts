import { ServiceModel } from "@/Core/Domain";

/**
 * The ServicesQuery describes all services beloning to an environment.
 */
export interface GetServices {
  kind: "GetServices";
}

export interface GetServicesManifest {
  error: string;
  apiResponse: { data: ServiceModel[] };
  data: ServiceModel[];
  usedData: ServiceModel[];
  query: GetServices;
}
