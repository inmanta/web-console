import { InstanceEvent } from "./EventModel";
import { InstanceLog } from "./InstanceLogModel";
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
import { ServiceInstanceParams } from "./ServiceInstanceParams";
import { RawDiagnostics, Diagnostics } from "./Diagnostics";
import { EventParams } from "./EventParams";

type Query =
  | ServicesQuery
  | ServiceQuery
  | ServiceInstancesQuery
  | ResourcesQuery
  | InstanceEventsQuery
  | InstanceLogsQuery
  | InstanceConfigQuery
  | DiagnosticsQuery;
export type Type = Query;

/**
 * The ServicesQuery describes all services beloning to an environment.
 */
export interface ServicesQuery {
  kind: "Services";
  qualifier: null;
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
  qualifier: Omit<VersionedServiceInstanceIdentifier, "environment">;
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
  qualifier: Omit<ServiceIdentifier, "environment"> & ServiceInstanceParams;
}

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
  qualifier: Omit<ServiceInstanceIdentifier, "environment"> & EventParams;
}

interface EventsManifest {
  error: string;
  apiResponse: {
    data: InstanceEvent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: InstanceEvent[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: InstanceEvent[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: InstanceEventsQuery;
}

/**
 * The instanceLogs query describes logs belonging to one specific service instance
 */
export interface InstanceLogsQuery {
  kind: "InstanceLogs";
  qualifier: Omit<ServiceInstanceIdentifier, "environment">;
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
  qualifier: Omit<ServiceInstanceIdentifier, "environment">;
}

interface InstanceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: Setting[];
  query: InstanceConfigQuery;
}

/** Diagnostics describe the status of an instance with regards to the diagnose call */
export interface DiagnosticsQuery {
  kind: "Diagnostics";
  qualifier: Omit<ServiceInstanceIdentifier, "environment">;
}

interface DiagnosticsManifest {
  error: string;
  apiResponse: { data: RawDiagnostics };
  data: Diagnostics;
  usedData: Diagnostics;
  query: DiagnosticsQuery;
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
  Diagnostics: DiagnosticsManifest;
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
