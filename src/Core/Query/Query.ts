import { GetCallbacks, GetCallbacksManifest } from "./GetCallbacks";
import { GetProjects, GetProjectsManifest } from "./GetProjects";
import { GetServerStatus, GetServerStatusManifest } from "./GetServerStatus";
import {
  GetEnvironmentDetails,
  GetEnvironmentDetailsManifest,
} from "./GetEnvironmentDetails";
import { GetServices, GetServicesManifest } from "./GetServices";
import { GetService, GetServiceManifest } from "./GetService";
import {
  GetServiceInstances,
  GetServiceInstancesManifest,
} from "./GetServiceInstances";
import {
  GetServiceInstance,
  GetServiceInstanceManifest,
} from "./GetServiceInstance";
import { GetServiceConfig, GetServiceConfigManifest } from "./GetServiceConfig";
import {
  GetInstanceResources,
  GetInstanceResourcesManifest,
} from "./GetInstanceResources";
import {
  GetInstanceEvents,
  GetInstanceEventsManifest,
} from "./GetInstanceEvents";
import { GetInstanceLogs, GetInstanceLogsManifest } from "./GetInstanceLogs";
import {
  GetInstanceConfig,
  GetInstanceConfigManifest,
} from "./GetInstanceConfig";
import { GetDiagnostics, GetDiagnosticsManifest } from "./GetDiagnostics";
import { GetResources, GetResourcesManifest } from "./GetResources";
import {
  GetResourceDetails,
  GetResourceDetailsManifest,
} from "./GetResourceDetails";
import {
  GetResourceHistory,
  GetResourceHistoryManifest,
} from "./GetResourceHistory";
import {
  GetCompileReports,
  GetCompileReportsManifest,
} from "./GetCompileReports";
import {
  GetCompileDetails,
  GetCompileDetailsManifest,
} from "./GetCompileDetails";
import { GetResourceLogs, GetResourceLogsManifest } from "./GetResourceLogs";
import {
  GetEnvironmentSettings,
  GetEnvironmentSettingsManifest,
} from "./GetEnvironmentSettings";

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
  | GetResources
  | GetResourceDetails
  | GetResourceHistory
  | GetResourceLogs
  | GetEnvironmentDetails
  | GetCompileReports
  | GetCompileDetails
  | GetServerStatus
  | GetCallbacks
  | GetEnvironmentSettings;

export type Type = Query;

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
  GetResources: GetResourcesManifest;
  GetResourceDetails: GetResourceDetailsManifest;
  GetResourceHistory: GetResourceHistoryManifest;
  GetResourceLogs: GetResourceLogsManifest;
  GetEnvironmentDetails: GetEnvironmentDetailsManifest;
  GetCompileReports: GetCompileReportsManifest;
  GetCompileDetails: GetCompileDetailsManifest;
  GetCallbacks: GetCallbacksManifest;
  GetEnvironmentSettings: GetEnvironmentSettingsManifest;
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
