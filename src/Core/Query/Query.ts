import { WithId } from "@/Core/Language";
import {
  InstanceEvent,
  InstanceLog,
  InstanceResourceModel,
  ServiceIdentifier,
  ServiceModel,
  VersionedServiceInstanceIdentifier,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
  ServiceInstanceIdentifier,
  Pagination,
  Config,
  ServiceInstanceParams,
  RawDiagnostics,
  Diagnostics,
  EventParams,
  ProjectModel,
  Resource,
  RawResource,
  RawResourceDetails,
  ResourceDetails,
  ResourceParams,
  ResourceHistory,
  ResourceLog,
  ResourceLogFilter,
  PageSize,
  Sort,
  ServerStatus,
  CompileDetails,
  CompileReportParams,
  CompileReport,
  EnvironmentDetails,
} from "@/Core/Domain";
import { GetCallbacks, GetCallbacksManifest } from "./GetCallbacks";

export type Query =
  | GetServices
  | GetService
  | GetServiceInstance
  | GetServiceInstances
  | GetServiceConfig
  | GetInstanceResources
  | GetInstanceEvents
  | GetInstanceLogs
  | GetInstanceConfig
  | GetDiagnostics
  | GetProjects
  | ResourcesQuery
  | ResourceDetailsQuery
  | ResourceHistoryQuery
  | ResourceLogsQuery
  | GetEnvironmentDetails
  | CompileReportsQuery
  | CompileDetailsQuery
  | GetServerStatus
  | GetCallbacks;

export type Type = Query;

export interface GetProjects {
  kind: "GetProjects";
}

interface GetProjectsManifest {
  error: string;
  apiResponse: { data: ProjectModel[] };
  data: ProjectModel[];
  usedData: ProjectModel[];
  query: GetProjects;
}

export interface GetServerStatus {
  kind: "GetServerStatus";
}

export interface GetServerStatusManifest {
  error: string;
  apiResponse: { data: ServerStatus };
  data: ServerStatus;
  usedData: ServerStatus;
  query: GetServerStatus;
}

export interface GetEnvironmentDetails {
  kind: "GetEnvironmentDetails";
}

interface GetEnvironmentDetailsManifest {
  error: string;
  apiResponse: { data: EnvironmentDetails };
  data: EnvironmentDetails;
  usedData: EnvironmentDetails;
  query: GetEnvironmentDetails;
}

/**
 * The ServicesQuery describes all services beloning to an environment.
 */
export interface GetServices {
  kind: "GetServices";
}

interface GetServicesManifest {
  error: string;
  apiResponse: { data: ServiceModel[] };
  data: ServiceModel[];
  usedData: ServiceModel[];
  query: GetServices;
}

/**
 * The ServiceQuery identifies 1 specific service.
 */
export interface GetService extends ServiceIdentifier {
  kind: "GetService";
}

interface GetServiceManifest {
  error: string;
  apiResponse: { data: ServiceModel };
  data: ServiceModel;
  usedData: ServiceModel;
  query: GetService;
}

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

interface GetServiceInstancesManifest {
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

export interface GetServiceInstance extends ServiceInstanceIdentifier {
  kind: "GetServiceInstance";
}

interface GetServiceInstanceManifest {
  error: string;
  apiResponse: { data: ServiceInstanceModel };
  data: ServiceInstanceModel;
  usedData: ServiceInstanceModel;
  query: GetServiceInstance;
}

export interface GetServiceConfig extends ServiceIdentifier {
  kind: "GetServiceConfig";
}

interface GetServiceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: Config;
  query: GetServiceConfig;
}

/**
 * The ResourcesQuery describes resources for a service instance.
 * We are not asking for 1 specific resource. We are asking for all the
 * resources of 1 specific service instance.
 */
export interface GetInstanceResources
  extends VersionedServiceInstanceIdentifier {
  kind: "GetInstanceResources";
}

interface GetInstanceResourcesManifest {
  error: string;
  apiResponse: { data: InstanceResourceModel[] };
  data: InstanceResourceModel[];
  usedData: InstanceResourceModel[];
  query: GetInstanceResources;
}

/**
 * The events query describes events belonging to one specific service instance
 */
export interface GetInstanceEvents
  extends ServiceInstanceIdentifier,
    EventParams.EventParams {
  kind: "GetInstanceEvents";
}

interface GetInstanceEventsManifest {
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
  query: GetInstanceEvents;
}

/**
 * The instanceLogs query describes logs belonging to one specific service instance
 */
export interface GetInstanceLogs extends ServiceInstanceIdentifier {
  kind: "GetInstanceLogs";
}

interface GetInstanceLogsManifest {
  error: string;
  apiResponse: { data: InstanceLog[] };
  data: InstanceLog[];
  usedData: InstanceLog[];
  query: GetInstanceLogs;
}

/**
 * The instanceConfig query describes the config belonging to one specific service instance
 */
export interface GetInstanceConfig extends ServiceInstanceIdentifier {
  kind: "GetInstanceConfig";
}

interface GetInstanceConfigManifest {
  error: string;
  apiResponse: { data: Config };
  data: Config;
  usedData: { config: Config; defaults: Config };
  query: GetInstanceConfig;
}

/** Diagnostics describe the status of an instance with regards to the diagnose call */
export interface GetDiagnostics extends ServiceInstanceIdentifier {
  kind: "GetDiagnostics";
}

interface GetDiagnosticsManifest {
  error: string;
  apiResponse: { data: RawDiagnostics };
  data: Diagnostics;
  usedData: Diagnostics;
  query: GetDiagnostics;
}

export interface ResourcesQuery extends ResourceParams.ResourceParams {
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

export interface ResourceDetailsQuery extends WithId {
  kind: "ResourceDetails";
}

interface ResourceDetailsManifest {
  error: string;
  apiResponse: {
    data: RawResourceDetails;
  };
  data: ResourceDetails;
  usedData: ResourceDetails;
  query: ResourceDetailsQuery;
}

export interface ResourceHistoryQuery extends WithId {
  kind: "ResourceHistory";
  sort?: Sort.Type;
  pageSize: PageSize.Type;
}

interface ResourceHistoryManifest {
  error: string;
  apiResponse: {
    data: ResourceHistory[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: ResourceHistory[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: ResourceHistory[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: ResourceHistoryQuery;
}

export interface CompileReportsQuery
  extends CompileReportParams.CompileReportParams {
  kind: "CompileReports";
}

interface CompileReportsManifest {
  error: string;
  apiResponse: {
    data: CompileReport[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: CompileReport[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: CompileReport[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: CompileReportsQuery;
}

export interface CompileDetailsQuery extends WithId {
  kind: "CompileDetails";
}

interface CompileDetailsManifest {
  error: string;
  apiResponse: {
    data: CompileDetails;
  };
  data: CompileDetails;
  usedData: CompileDetails;
  query: CompileDetailsQuery;
}

export interface ResourceLogsQuery extends WithId {
  kind: "ResourceLogs";
  filter?: ResourceLogFilter;
  sort?: Sort.Type;
  pageSize: PageSize.Type;
}

interface ResourceLogsManifest {
  error: string;
  apiResponse: {
    data: ResourceLog[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  data: {
    data: ResourceLog[];
    links: Pagination.Links;
    metadata: Pagination.Metadata;
  };
  usedData: {
    data: ResourceLog[];
    handlers: Pagination.Handlers;
    metadata: Pagination.Metadata;
  };
  query: ResourceLogsQuery;
}

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub queries.
 */
interface Manifest {
  GetServices: GetServicesManifest;
  GetService: GetServiceManifest;
  GetServiceInstance: GetServiceInstanceManifest;
  GetServiceInstances: GetServiceInstancesManifest;
  GetServiceConfig: GetServiceConfigManifest;
  GetInstanceResources: GetInstanceResourcesManifest;
  GetInstanceEvents: GetInstanceEventsManifest;
  GetInstanceLogs: GetInstanceLogsManifest;
  GetInstanceConfig: GetInstanceConfigManifest;
  GetDiagnostics: GetDiagnosticsManifest;
  GetProjects: GetProjectsManifest;
  GetServerStatus: GetServerStatusManifest;
  Resources: ResourcesManifest;
  ResourceDetails: ResourceDetailsManifest;
  ResourceHistory: ResourceHistoryManifest;
  ResourceLogs: ResourceLogsManifest;
  GetEnvironmentDetails: GetEnvironmentDetailsManifest;
  CompileReports: CompileReportsManifest;
  CompileDetails: CompileDetailsManifest;
  GetCallbacks: GetCallbacksManifest;
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
