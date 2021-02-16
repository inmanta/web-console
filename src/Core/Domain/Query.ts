import { ResourceModel } from "./ResourceModel";
import { ServiceInstanceIdentifier } from "./ServiceInstanceModel";

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

export interface ServiceInstancesQualifier {
  serviceName: string;
  environment: string;
}

export interface ServiceInstancesQuery {
  kind: "ServiceInstances";
  qualifier: ServiceInstancesQualifier;
}

type Query = ResourcesQuery | ServiceInstancesQuery;

export type Type = Query;

interface Manifest {
  Resources: {
    error: string;
    data: ResourceModel[];
    query: ResourcesQuery;
  };
  ServiceInstances: {
    error: string;
    data: ServiceInstanceModel[];
    query: ServiceInstancesQuery;
  };
}

export type Kind = Query["kind"];

export type Error<K extends Kind> = Manifest[K]["error"];

export type Data<K extends Kind> = Manifest[K]["data"];

export type SubQuery<K extends Kind> = Manifest[K]["query"];
