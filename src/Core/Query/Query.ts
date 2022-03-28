import { RemoteData } from "@/Core/Language";
import * as GetAgentProcess from "@S/AgentProcess/Core/Query";
import * as GetAgents from "@S/Agents/Core/Query";
import * as GetCompileDetails from "@S/CompileDetails/Core/Query";
import * as GetCompileReports from "@S/CompileReports/Core/Query";
import * as GetDryRunReport from "@S/ComplianceCheck/Core/DryRunReportQuery";
import * as GetDryRuns from "@S/ComplianceCheck/Core/DryRunsQuery";
import * as GetInstanceEvents from "@S/Events/Core/Query";
import * as GetFacts from "@S/Facts/Core/Query";
import * as GetNotifications from "@S/Notification/Core/Query";
import * as GetResources from "@S/Resource/Core/Query";
import * as GetEnvironmentDetails from "@S/Settings/Core/GetEnvironmentDetailsQuery";
import * as GetProjects from "@S/Settings/Core/GetProjectsQuery";
import { GetCallbacks, GetCallbacksManifest } from "./GetCallbacks";
import {
  GetCompilerStatus,
  GetCompilerStatusManifest,
} from "./GetCompilerStatus";
import { GetDesiredStateDiff } from "./GetDesiredStateDiff";
import { GetDesiredStates, GetDesiredStatesManifest } from "./GetDesiredStates";
import { GetDiagnostics, GetDiagnosticsManifest } from "./GetDiagnostics";
import {
  GetEnvironmentSetting,
  GetEnvironmentSettingManifest,
} from "./GetEnvironmentSetting";
import {
  GetEnvironmentSettings,
  GetEnvironmentSettingsManifest,
} from "./GetEnvironmentSettings";
import { GetEnvironments, GetEnvironmentsManifest } from "./GetEnvironments";

import {
  GetInstanceConfig,
  GetInstanceConfigManifest,
} from "./GetInstanceConfig";
import { GetInstanceLogs, GetInstanceLogsManifest } from "./GetInstanceLogs";
import {
  GetInstanceResources,
  GetInstanceResourcesManifest,
} from "./GetInstanceResources";
import { GetParameters } from "./GetParameters";
import {
  GetResourceDetails,
  GetResourceDetailsManifest,
} from "./GetResourceDetails";
import { GetResourceFacts, GetResourceFactsManifest } from "./GetResourceFacts";
import {
  GetResourceHistory,
  GetResourceHistoryManifest,
} from "./GetResourceHistory";
import { GetResourceLogs, GetResourceLogsManifest } from "./GetResourceLogs";
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
  | GetInstanceEvents.Query
  | GetInstanceLogs
  | GetInstanceConfig
  | GetDiagnostics
  | GetProjects.Query
  | GetResources.Query
  | GetResourceDetails
  | GetResourceHistory
  | GetResourceLogs
  | GetEnvironmentDetails.Query
  | GetCompileReports.Query
  | GetCompileDetails.Query
  | GetServerStatus
  | GetCallbacks
  | GetEnvironmentSettings
  | GetEnvironmentSetting
  | GetEnvironments
  | GetFacts.Query
  | GetResourceFacts
  | GetAgents.Query
  | GetAgentProcess.Query
  | GetDesiredStates
  | GetVersionResources
  | GetCompilerStatus
  | GetParameters.Query
  | GetDesiredStateDiff.Query
  | GetDryRuns.Query
  | GetDryRunReport.Query
  | GetVersionedResourceDetails.Query
  | GetNotifications.Query;

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
  GetInstanceEvents: GetInstanceEvents.Manifest;
  GetInstanceLogs: GetInstanceLogsManifest;
  GetInstanceConfig: GetInstanceConfigManifest;
  GetDiagnostics: GetDiagnosticsManifest;
  GetProjects: GetProjects.Manifest;
  GetServerStatus: GetServerStatusManifest;
  GetResources: GetResources.Manifest;
  GetResourceDetails: GetResourceDetailsManifest;
  GetResourceHistory: GetResourceHistoryManifest;
  GetResourceLogs: GetResourceLogsManifest;
  GetEnvironmentDetails: GetEnvironmentDetails.Manifest;
  GetCompileReports: GetCompileReports.Manifest;
  GetCompileDetails: GetCompileDetails.Manifest;
  GetCallbacks: GetCallbacksManifest;
  GetEnvironmentSettings: GetEnvironmentSettingsManifest;
  GetEnvironmentSetting: GetEnvironmentSettingManifest;
  GetEnvironments: GetEnvironmentsManifest;
  GetResourceFacts: GetResourceFactsManifest;
  GetAgents: GetAgents.Manifest;
  GetAgentProcess: GetAgentProcess.Manifest;
  GetDesiredStates: GetDesiredStatesManifest;
  GetVersionResources: GetVersionResourcesManifest;
  GetCompilerStatus: GetCompilerStatusManifest;
  GetParameters: GetParameters.Manifest;
  GetFacts: GetFacts.Manifest;
  GetDesiredStateDiff: GetDesiredStateDiff.Manifest;
  GetDryRuns: GetDryRuns.Manifest;
  GetDryRunReport: GetDryRunReport.Manifest;
  GetVersionedResourceDetails: GetVersionedResourceDetails.Manifest;
  GetNotifications: GetNotifications.Manifest;
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
export type UsedApiData<K extends Kind> = RemoteData.RemoteData<
  Error<K>,
  UsedData<K>
>;
