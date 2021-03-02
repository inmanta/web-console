import { InstanceEvent } from "./EventModel";
import { InstanceLog } from "./InstanceLogModel";
import { EnvironmentIdentifier } from "./ProjectModel";
import { ResourceModel } from "./ResourceModel";
import {
  ServiceInstanceIdentifier,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
} from "./ServiceInstanceModel";
import { ServiceIdentifier, ServiceModel } from "./ServiceModel";

type Query =
  | ServicesQuery
  | ServiceQuery
  | ServiceInstancesQuery
  | ResourcesQuery
  | InstanceEventsQuery
  | InstanceLogsQuery;
export type Type = Query;

/**
 * The ServicesQuery describes all services beloning to an environment.
 */
export interface ServicesQuery {
  kind: "Services";
  qualifier: EnvironmentIdentifier;
}

interface ServicesManifest {
  error: string;
  apiResponse: ServiceModel[];
  data: ServiceModel[];
  query: ServicesQuery;
}

/**
 * The ServiceQuery describes a service. The qualifier identifies 1
 * specific service.
 */
export interface ServiceQuery {
  kind: "Service";
  qualifier: ServiceIdentifier;
}

interface ServiceManifest {
  error: string;
  apiResponse: ServiceModel;
  data: ServiceModel;
  query: ServiceQuery;
}

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

interface ResourcesManifest {
  error: string;
  apiResponse: ResourceModel[];
  data: ResourceModel[];
  query: ResourcesQuery;
}

/**
 * The ServiceInstancesQuery describes instances of a service.
 * We are asking for all the instances of 1 unique service
 * based on its name and environment. The qualifier identifies 1
 * specific service.
 */
export interface ServiceInstancesQuery {
  kind: "ServiceInstances";
  qualifier: ServiceIdentifier;
}

interface ServiceInstancesManifest {
  error: string;
  apiResponse: ServiceInstanceModel[];
  data: ServiceInstanceModelWithTargetStates[];
  query: ServiceInstancesQuery;
}

/**
 * The events query describes events belonging to one specific service instance
 */
export interface InstanceEventsQuery {
  kind: "Events";
  qualifier: Omit<ServiceInstanceIdentifier, "version">;
}

interface EventsManifest {
  error: string;
  apiResponse: InstanceEvent[];
  data: InstanceEvent[];
  query: InstanceEventsQuery;
}

/**
 * The events query describes events belonging to one specific service instance
 */
export interface InstanceLogsQuery {
  kind: "InstanceLogs";
  qualifier: Omit<ServiceInstanceIdentifier, "version">;
}

interface InstanceLogsManifest {
  error: string;
  apiResponse: InstanceLog[];
  data: InstanceLog[];
  query: InstanceLogsQuery;
}

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub queries.
 */
interface Manifest {
  Services: ServicesManifest;
  Service: ServiceManifest;
  ServiceInstances: ServiceInstancesManifest;
  Resources: ResourcesManifest;
  Events: EventsManifest;
  InstanceLogs: InstanceLogsManifest;
}

/**
 * Query Utilities
 */
export type Kind = Query["kind"];
export type Error<K extends Kind> = Manifest[K]["error"];
export type Data<K extends Kind> = Manifest[K]["data"];
export type ApiResponse<K extends Kind> = Manifest[K]["apiResponse"];
export type SubQuery<K extends Kind> = Manifest[K]["query"];
export type Qualifier<K extends Kind> = SubQuery<K>["qualifier"];
