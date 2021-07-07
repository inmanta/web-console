import { InstanceEvent } from "./EventModel";
import { InstanceLog } from "./InstanceLogModel";
import { InstanceResourceModel as InstanceResourceModel } from "./InstanceResourceModel";
import {
  VersionedServiceInstanceIdentifier,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
  ServiceInstanceIdentifier,
} from "./ServiceInstanceModel";
import { ServiceIdentifier, ServiceModel } from "./ServiceModel";
import * as Pagination from "./Pagination";
import { Config } from "./Config";
import { ServiceInstanceParams } from "./ServiceInstanceParams";
import { RawDiagnostics, Diagnostics } from "./Diagnostics";
import { EventParams } from "./EventParams";
import { ProjectModel } from "./ProjectModel";
import { Resource, RawResource } from "./Resource";
import { ResourceParams as ResourceParams } from "./ResourceParams";

type Query =
  | ServicesQuery
  | ServiceQuery
  | ServiceInstancesQuery
  | ServiceConfigQuery
  | InstanceResourcesQuery
  | InstanceEventsQuery
  | InstanceLogsQuery
  | InstanceConfigQuery
  | DiagnosticsQuery
  | ProjectsQuery
  | ResourcesQuery;

export type Type = Query;

export interface ProjectsQuery {
  kind: "Projects";
}

interface ProjectsManifest {
  error: string;
  apiResponse: { data: ProjectModel[] };
  data: ProjectModel[];
  usedData: ProjectModel[];
  query: ProjectsQuery;
}

/**
 * The ServicesQuery describes all services beloning to an environment.
 */
export interface ServicesQuery {
  kind: "Services";
}

interface ServicesManifest {
  error: string;
  apiResponse: { data: ServiceModel[] };
  data: ServiceModel[];
  usedData: ServiceModel[];
  query: ServicesQuery;
}

/**
 * The ServiceQuery identifies 1 specific service.
 */
export interface ServiceQuery extends ServiceIdentifier {
  kind: "Service";
}

interface ServiceManifest {
  error: string;
  apiResponse: { data: ServiceModel };
  data: ServiceModel;
  usedData: ServiceModel;
  query: ServiceQuery;
}

/**
 * The ServiceInstancesQuery describes instances of a service.
 * We are asking for all the instances of 1 unique service
 * based on its name and environment.
 */
export interface ServiceInstancesQuery
  extends ServiceIdentifier,
    ServiceInstanceParams {
  kind: "ServiceInstances";
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

export interface ServiceConfigQuery extends ServiceIdentifier {
  kind: "ServiceConfig";
}

interface ServiceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: Config;
  query: ServiceConfigQuery;
}

/**
 * The ResourcesQuery describes resources for a service instance.
 * We are not asking for 1 specific resource. We are asking for all the
 * resources of 1 specific service instance.
 */
export interface InstanceResourcesQuery
  extends VersionedServiceInstanceIdentifier {
  kind: "InstanceResources";
}

interface InstanceResourcesManifest {
  error: string;
  apiResponse: { data: InstanceResourceModel[] };
  data: InstanceResourceModel[];
  usedData: InstanceResourceModel[];
  query: InstanceResourcesQuery;
}

/**
 * The events query describes events belonging to one specific service instance
 */
export interface InstanceEventsQuery
  extends ServiceInstanceIdentifier,
    EventParams {
  kind: "Events";
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
export interface InstanceLogsQuery extends ServiceInstanceIdentifier {
  kind: "InstanceLogs";
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
export interface InstanceConfigQuery extends ServiceInstanceIdentifier {
  kind: "InstanceConfig";
}

interface InstanceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: { config: Config; defaults: Config };
  query: InstanceConfigQuery;
}

/** Diagnostics describe the status of an instance with regards to the diagnose call */
export interface DiagnosticsQuery extends ServiceInstanceIdentifier {
  kind: "Diagnostics";
}

interface DiagnosticsManifest {
  error: string;
  apiResponse: { data: RawDiagnostics };
  data: Diagnostics;
  usedData: Diagnostics;
  query: DiagnosticsQuery;
}

export interface ResourcesQuery extends ResourceParams {
  kind: "Resources";
}

interface ResourcesManifest {
  error: string;
  apiResponse: {
    data: RawResource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: Resource[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: Resource[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: ResourcesQuery;
}

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub queries.
 */
interface Manifest {
  Services: ServicesManifest;
  Service: ServiceManifest;
  ServiceInstances: ServiceInstancesManifest;
  ServiceConfig: ServiceConfigManifest;
  InstanceResources: InstanceResourcesManifest;
  Events: EventsManifest;
  InstanceLogs: InstanceLogsManifest;
  InstanceConfig: InstanceConfigManifest;
  Diagnostics: DiagnosticsManifest;
  Projects: ProjectsManifest;
  Resources: ResourcesManifest;
}

/**
 * Query Utilities
 */
export type Kind = Query["kind"];
export type Error<K extends Kind> = Manifest[K]["error"];
export type Data<K extends Kind> = Manifest[K]["data"];
export type ApiResponse<K extends Kind> = Manifest[K]["apiResponse"];
export type SubQuery<K extends Kind> = Manifest[K]["query"];
export type UsedData<K extends Kind> = Manifest[K]["usedData"];
