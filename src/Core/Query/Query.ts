import { GetAgentProcess, GetAgentProcessManifest } from "./GetAgentProcess";
import { GetAgents, GetAgentsManifest } from "./GetAgents";
import { GetCallbacks, GetCallbacksManifest } from "./GetCallbacks";
import {
  GetCompileDetails,
  GetCompileDetailsManifest,
} from "./GetCompileDetails";
import {
  GetCompileReports,
  GetCompileReportsManifest,
} from "./GetCompileReports";
import {
  GetCompilerStatus,
  GetCompilerStatusManifest,
} from "./GetCompilerStatus";
import { GetDesiredStates, GetDesiredStatesManifest } from "./GetDesiredStates";
import { GetDiagnostics, GetDiagnosticsManifest } from "./GetDiagnostics";
import {
  GetEnvironmentDetails,
  GetEnvironmentDetailsManifest,
} from "./GetEnvironmentDetails";
import {
  GetEnvironmentSetting,
  GetEnvironmentSettingManifest,
} from "./GetEnvironmentSetting";
import {
  GetEnvironmentSettings,
  GetEnvironmentSettingsManifest,
} from "./GetEnvironmentSettings";
import { GetEnvironments, GetEnvironmentsManifest } from "./GetEnvironments";
import { GetFacts, GetFactsManifest } from "./GetFacts";
import {
  GetInstanceConfig,
  GetInstanceConfigManifest,
} from "./GetInstanceConfig";
import {
  GetInstanceEvents,
  GetInstanceEventsManifest,
} from "./GetInstanceEvents";
import { GetInstanceLogs, GetInstanceLogsManifest } from "./GetInstanceLogs";
import {
  GetInstanceResources,
  GetInstanceResourcesManifest,
} from "./GetInstanceResources";
import { GetProjects, GetProjectsManifest } from "./GetProjects";
import {
  GetResourceDetails,
  GetResourceDetailsManifest,
} from "./GetResourceDetails";
import {
  GetResourceHistory,
  GetResourceHistoryManifest,
} from "./GetResourceHistory";
import { GetResourceLogs, GetResourceLogsManifest } from "./GetResourceLogs";
import { GetResources, GetResourcesManifest } from "./GetResources";
import { GetServerStatus, GetServerStatusManifest } from "./GetServerStatus";
import { GetService, GetServiceManifest } from "./GetService";
import { GetServiceConfig, GetServiceConfigManifest } from "./GetServiceConfig";
import {
  GetServiceInstance,
  GetServiceInstanceManifest,
} from "./GetServiceInstance";
import {
  GetServiceInstances,
  GetServiceInstancesManifest,
} from "./GetServiceInstances";
import { GetServices, GetServicesManifest } from "./GetServices";
import {
  GetVersionResources,
  GetVersionResourcesManifest,
} from "./GetVersionResources";
import { GetVersionedResourceDetails } from "./GetVersionedResourceDetails";

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
  | GetEnvironmentSettings
  | GetEnvironmentSetting
  | GetEnvironments
  | GetFacts
  | GetAgents
  | GetAgentProcess
  | GetDesiredStates
  | GetVersionResources
  | GetCompilerStatus
  | GetVersionedResourceDetails.Query;

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
  GetEnvironmentSetting: GetEnvironmentSettingManifest;
  GetEnvironments: GetEnvironmentsManifest;
  GetFacts: GetFactsManifest;
  GetAgents: GetAgentsManifest;
  GetAgentProcess: GetAgentProcessManifest;
  GetDesiredStates: GetDesiredStatesManifest;
  GetVersionResources: GetVersionResourcesManifest;
  GetCompilerStatus: GetCompilerStatusManifest;
  GetVersionedResourceDetails: GetVersionedResourceDetails.Manifest;
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
