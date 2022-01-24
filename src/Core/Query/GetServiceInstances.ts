import {
  ServiceIdentifier,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
  Pagination,
  ServiceInstanceParams,
} from "@/Core/Domain";

/**
 * The ServiceInstancesQuery describes instances of a service.
 * We are asking for all the instances of 1 unique service
 * based on its name and environment.
 */
export interface GetServiceInstances
  extends ServiceIdentifier,
    ServiceInstanceParams.ServiceInstanceParams {
  kind: "GetServiceInstances";
}

export interface GetServiceInstancesManifest {
  error: string;
  apiResponse: {
    data: ServiceInstanceModel[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: ServiceInstanceModelWithTargetStates[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: ServiceInstanceModelWithTargetStates[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: GetServiceInstances;
}
