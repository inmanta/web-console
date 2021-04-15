import { InstanceEvent } from "./EventModel";
import { InstanceLog } from "./InstanceLogModel";
import { EnvironmentIdentifier } from "./ProjectModel";
import { ResourceModel } from "./ResourceModel";
import {
  VersionedServiceInstanceIdentifier,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
  ServiceInstanceIdentifier,
} from "./ServiceInstanceModel";
import { ServiceIdentifier, ServiceModel } from "./ServiceModel";
import * as Pagination from "./Pagination";
import { Config, Setting } from "./Config";

type Query =
  | ServicesQuery
  | ServiceQuery
  | ServiceInstancesQuery
  | ResourcesQuery
  | InstanceEventsQuery
  | InstanceLogsQuery
  | InstanceConfigQuery;
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
  apiResponse: { data: ServiceModel[] };
  data: ServiceModel[];
  usedData: ServiceModel[];
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
  apiResponse: { data: ServiceModel };
  data: ServiceModel;
  usedData: ServiceModel;
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
  qualifier: VersionedServiceInstanceIdentifier;
}

interface ResourcesManifest {
  error: string;
  apiResponse: { data: ResourceModel[] };
  data: ResourceModel[];
  usedData: ResourceModel[];
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
  qualifier: ServiceIdentifier & { filter?: Filter; sort?: Sort };
}

export enum Attributes {
  Active = "active_attributes",
  Candidate = "candidate_attributes",
  Rollback = "rollback_attributes",
}

export interface Filter {
  id?: string[];
  state?: string[];
  attributeSetEmpty?: Attributes[];
  attributeSetNotEmpty?: Attributes[];
  deleted?: Deleted;
}

export type Deleted = "Include" | "Only" | undefined;

export interface RawFilter {
  id?: string[];
  state?: string[];
  deleted?: boolean;
  attribute_set_empty?: Attributes[];
  attribute_set_not_empty?: Attributes[];
}

export interface Sort {
  name: string;
  order: SortDirection;
}
export type SortDirection = "asc" | "desc";

interface ServiceInstancesManifest {
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
  query: ServiceInstancesQuery;
}

/**
 * The events query describes events belonging to one specific service instance
 */
export interface InstanceEventsQuery {
  kind: "Events";
  qualifier: ServiceInstanceIdentifier;
}

interface EventsManifest {
  error: string;
  apiResponse: { data: InstanceEvent[] };
  data: InstanceEvent[];
  usedData: InstanceEvent[];
  query: InstanceEventsQuery;
}

/**
 * The instanceLogs query describes logs belonging to one specific service instance
 */
export interface InstanceLogsQuery {
  kind: "InstanceLogs";
  qualifier: ServiceInstanceIdentifier;
}

interface InstanceLogsManifest {
  error: string;
  apiResponse: { data: InstanceLog[] };
  data: InstanceLog[];
  usedData: InstanceLog[];
  query: InstanceLogsQuery;
}

/**
 * The instanceConfig query describes the config belonging to one specific service instance
 */
export interface InstanceConfigQuery {
  kind: "InstanceConfig";
  qualifier: ServiceInstanceIdentifier;
}

interface InstanceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: Setting[];
  query: InstanceConfigQuery;
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
  InstanceConfig: InstanceConfigManifest;
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
export type UsedData<K extends Kind> = Manifest[K]["usedData"];
