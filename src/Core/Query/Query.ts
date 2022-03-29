import { RemoteData } from "@/Core/Language";
import * as GetAgentProcess from "@S/AgentProcess/Core/Query";
import * as GetAgents from "@S/Agents/Core/Query";
import * as GetCompileDetails from "@S/CompileDetails/Core/Query";
import * as GetCompileReports from "@S/CompileReports/Core/Query";
import * as GetDryRunReport from "@S/ComplianceCheck/Core/DryRunReportQuery";
import * as GetDryRuns from "@S/ComplianceCheck/Core/DryRunsQuery";
import * as GetDesiredStates from "@S/DesiredState/Core/Query";
import * as GetDesiredStateDiff from "@S/DesiredStateCompare/Core/Query";
import * as GetVersionResources from "@S/DesiredStateDetails/Core/Query";
import * as GetDiagnostics from "@S/Diagnose/Core/Query";
import * as GetInstanceEvents from "@S/Events/Core/Query";
import * as GetFacts from "@S/Facts/Core/Query";
import * as GetNotifications from "@S/Notification/Core/Query";
import * as GetParameters from "@S/Parameters/Core/Query";
import * as GetResources from "@S/Resource/Core/Query";
import * as GetResourceDetails from "@S/ResourceDetails/Core/GetResourceDetailsQuery";
import * as GetResourceFacts from "@S/ResourceDetails/Core/GetResourceFactsQuery";
import * as GetResourceHistory from "@S/ResourceDetails/Core/GetResourceHistoryQuery";
import * as GetResourceLogs from "@S/ResourceDetails/Core/GetResourceLogsQuery";
import * as GetInstanceLogs from "@S/ServiceInstanceHistory/Core/Query";
import * as GetEnvironmentDetails from "@S/Settings/Core/GetEnvironmentDetailsQuery";
import * as GetProjects from "@S/Settings/Core/GetProjectsQuery";
import { GetCallbacks, GetCallbacksManifest } from "./GetCallbacks";
import {
  GetCompilerStatus,
  GetCompilerStatusManifest,
} from "./GetCompilerStatus";
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
import {
  GetInstanceResources,
  GetInstanceResourcesManifest,
} from "./GetInstanceResources";
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
import { GetVersionedResourceDetails } from "./GetVersionedResourceDetails";

export type Query =
  | GetServices
  | GetService
  | GetServiceInstance
  | GetServiceInstances
  | GetServiceConfig
  | GetInstanceResources
  | GetInstanceEvents.Query
  | GetInstanceLogs.Query
  | GetInstanceConfig
  | GetDiagnostics.Query
  | GetProjects.Query
  | GetResources.Query
  | GetResourceDetails.Query
  | GetResourceHistory.Query
  | GetResourceLogs.Query
  | GetEnvironmentDetails.Query
  | GetCompileReports.Query
  | GetCompileDetails.Query
  | GetServerStatus
  | GetCallbacks
  | GetEnvironmentSettings
  | GetEnvironmentSetting
  | GetEnvironments
  | GetFacts.Query
  | GetResourceFacts.Query
  | GetAgents.Query
  | GetAgentProcess.Query
  | GetDesiredStates.Query
  | GetVersionResources.Query
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
  GetInstanceLogs: GetInstanceLogs.Manifest;
  GetInstanceConfig: GetInstanceConfigManifest;
  GetDiagnostics: GetDiagnostics.Manifest;
  GetProjects: GetProjects.Manifest;
  GetServerStatus: GetServerStatusManifest;
  GetResources: GetResources.Manifest;
  GetResourceDetails: GetResourceDetails.Manifest;
  GetResourceHistory: GetResourceHistory.Manifest;
  GetResourceLogs: GetResourceLogs.Manifest;
  GetEnvironmentDetails: GetEnvironmentDetails.Manifest;
  GetCompileReports: GetCompileReports.Manifest;
  GetCompileDetails: GetCompileDetails.Manifest;
  GetCallbacks: GetCallbacksManifest;
  GetEnvironmentSettings: GetEnvironmentSettingsManifest;
  GetEnvironmentSetting: GetEnvironmentSettingManifest;
  GetEnvironments: GetEnvironmentsManifest;
  GetResourceFacts: GetResourceFacts.Manifest;
  GetAgents: GetAgents.Manifest;
  GetAgentProcess: GetAgentProcess.Manifest;
  GetDesiredStates: GetDesiredStates.Manifest;
  GetVersionResources: GetVersionResources.Manifest;
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
