import { ResourceModel } from "./ResourceModel";
import {
  ServiceInstanceIdentifier,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
} from "./ServiceInstanceModel";
import { ServiceIdentifier } from "./ServiceModel";

/**
 * The ResourcesQuery describes resources for a service instance.
 * We are not asking for 1 specific resource. We are asking for all the
 * resources of 1 specific service instance. So the qualifier property
 * identifies a service instance.
 */
export interface ResourcesQuery {
  kind: "Resources";
  qualifier: ServiceInstanceIdentifier;
}

/**
 * The ServiceInstancesQuery describes instances of a service.
 * We are asking for all the instances of 1 unique service
 * based on its name and environment.
 */
export interface ServiceInstancesQuery {
  kind: "ServiceInstances";
  qualifier: ServiceIdentifier;
}

type Query = ResourcesQuery | ServiceInstancesQuery;

export type Type = Query;

interface Manifest {
  Resources: {
    error: string;
    apiResponse: ResourceModel[];
    data: ResourceModel[];
    query: ResourcesQuery;
  };
  ServiceInstances: {
    error: string;
    apiResponse: ServiceInstanceModel[];
    data: ServiceInstanceModelWithTargetStates[];
    query: ServiceInstancesQuery;
  };
}

export type Kind = Query["kind"];

export type Error<K extends Kind> = Manifest[K]["error"];

export type Data<K extends Kind> = Manifest[K]["data"];

export type ApiResponse<K extends Kind> = Manifest[K]["apiResponse"];

export type SubQuery<K extends Kind> = Manifest[K]["query"];
