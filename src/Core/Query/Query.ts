import { RemoteData } from "@/Core/Language";
import {
  GetEnvironmentSetting,
  GetEnvironmentSettingManifest,
} from "@/Data/Managers/EnvironmentSettings/GetEnvironmentSettingInterface";
import {
  GetEnvironmentSettings,
  GetEnvironmentSettingsManifest,
} from "@/Data/Managers/EnvironmentSettings/GetEnvironmentSettings/interface";
import {
  GetCompilationState,
  GetCompilationStateManifest,
} from "@/Data/Managers/GetCompilationState/interface";
import {
  GetCompilerStatus,
  GetCompilerStatusManifest,
} from "@/Data/Managers/GetCompilerStatus/interface";
import {
  GetEnvironments,
  GetEnvironmentsManifest,
} from "@/Data/Managers/GetEnvironments/interface";
import {
  GetEnvironmentsContinuous,
  GetEnvironmentsContinuousManifest,
} from "@/Data/Managers/GetEnvironmentsContinuous/interface";
import {
  GetServiceInstance,
  GetServiceInstanceManifest,
} from "@/Data/Managers/GetInstance/interface";
import {
  GetInstanceResources,
  GetInstanceResourcesManifest,
} from "@/Data/Managers/GetInstanceResources/interface";
import {
  GetInstanceWithRelations,
  GetInstanceWithRelationsManifest,
} from "@/Data/Managers/GetInstanceWithRelations/interface";
import {
  GetServerStatus,
  GetServerStatusManifest,
} from "@/Data/Managers/GetServerStatus/interface";
import {
  GetVersionFile,
  GetVersionFileManifest,
} from "@/Data/Managers/GetVersionFile/interface";
import {
  GetInstanceConfig,
  GetInstanceConfigManifest,
} from "@/Data/Managers/InstanceConfig/interfaces";
import {
  GetService,
  GetServiceManifest,
} from "@/Data/Managers/Service/interface";
import {
  GetServiceConfig,
  GetServiceConfigManifest,
} from "@/Data/Managers/ServiceConfig/interfaces";
import {
  GetServiceInstances,
  GetServiceInstancesManifest,
} from "@/Data/Managers/ServiceInstances/interface";
import {
  GetServices,
  GetServicesManifest,
} from "@/Data/Managers/Services/interface";
import * as GetAgentProcess from "@S/AgentProcess/Core/Query";
import * as GetAgents from "@S/Agents/Core/Query";
import * as GetCompileDetails from "@S/CompileDetails/Core/Query";
import * as GetCompileReports from "@S/CompileReports/Core/Query";
import * as GetDryRunReport from "@S/ComplianceCheck/Core/DryRunReportQuery";
import * as GetDryRuns from "@S/ComplianceCheck/Core/DryRunsQuery";
import * as GetMetrics from "@S/Dashboard/Core/Query";
import * as GetDesiredStates from "@S/DesiredState/Core/Query";
import * as GetDesiredStateDiff from "@S/DesiredStateCompare/Core/Query";
import * as GetVersionResources from "@S/DesiredStateDetails/Core/Query";
import * as GetVersionedResourceDetails from "@S/DesiredStateResourceDetails/Core/Query";
import * as GetDiagnostics from "@S/Diagnose/Core/Query";
import * as GetInstanceEvents from "@S/Events/Core/Query";
import * as GetFacts from "@S/Facts/Core/Query";
import * as GetNotifications from "@S/Notification/Core/Query";
import * as GetOrderDetails from "@S/OrderDetails/Core/Query";
import * as GetOrders from "@S/Orders/Core/Query";
import * as GetParameters from "@S/Parameters/Core/Query";
import * as GetResources from "@S/Resource/Core/Query";
import * as GetResourceDetails from "@S/ResourceDetails/Core/GetResourceDetailsQuery";
import * as GetResourceFacts from "@S/ResourceDetails/Core/GetResourceFactsQuery";
import * as GetResourceHistory from "@S/ResourceDetails/Core/GetResourceHistoryQuery";
import * as GetResourceLogs from "@S/ResourceDetails/Core/GetResourceLogsQuery";
import * as GetDiscoveredResources from "@S/ResourceDiscovery/Core/Query";
import * as GetCallbacks from "@S/ServiceDetails/Core/GetCallbacksQuery";
import * as GetInstanceLogs from "@S/ServiceInstanceHistory/Core/Query";
import * as GetEnvironmentDetails from "@S/Settings/Core/GetEnvironmentDetailsQuery";
import * as GetProjects from "@S/Settings/Core/GetProjectsQuery";

export type Query =
  | GetServices
  | GetService
  | GetServiceInstance
  | GetInstanceWithRelations
  | GetServiceInstances
  | GetServiceConfig
  | GetInstanceResources
  | GetInstanceEvents.Query
  | GetInstanceLogs.Query
  | GetInstanceConfig
  | GetMetrics.Query
  | GetDiagnostics.Query
  | GetDiscoveredResources.Query
  | GetProjects.Query
  | GetResources.Query
  | GetResourceDetails.Query
  | GetResourceHistory.Query
  | GetResourceLogs.Query
  | GetOrders.Query
  | GetOrderDetails.Query
  | GetEnvironmentDetails.Query
  | GetCompileReports.Query
  | GetCompileDetails.Query
  | GetServerStatus
  | GetCallbacks.Query
  | GetEnvironmentSettings
  | GetEnvironmentSetting
  | GetEnvironments
  | GetEnvironmentsContinuous
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
  | GetNotifications.Query
  | GetCompilationState
  | GetVersionFile;

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
  GetInstanceWithRelations: GetInstanceWithRelationsManifest;
  GetInstanceResources: GetInstanceResourcesManifest;
  GetInstanceEvents: GetInstanceEvents.Manifest;
  GetInstanceLogs: GetInstanceLogs.Manifest;
  GetInstanceConfig: GetInstanceConfigManifest;
  GetDiagnostics: GetDiagnostics.Manifest;
  GetDiscoveredResources: GetDiscoveredResources.Manifest;
  GetMetrics: GetMetrics.Manifest;
  GetProjects: GetProjects.Manifest;
  GetServerStatus: GetServerStatusManifest;
  GetResources: GetResources.Manifest;
  GetResourceDetails: GetResourceDetails.Manifest;
  GetResourceHistory: GetResourceHistory.Manifest;
  GetResourceLogs: GetResourceLogs.Manifest;
  GetOrders: GetOrders.Manifest;
  GetOrderDetails: GetOrderDetails.Manifest;
  GetEnvironmentDetails: GetEnvironmentDetails.Manifest;
  GetCompileReports: GetCompileReports.Manifest;
  GetCompileDetails: GetCompileDetails.Manifest;
  GetCompilationState: GetCompilationStateManifest;
  GetCallbacks: GetCallbacks.Manifest;
  GetEnvironmentSettings: GetEnvironmentSettingsManifest;
  GetEnvironmentSetting: GetEnvironmentSettingManifest;
  GetEnvironments: GetEnvironmentsManifest;
  GetEnvironmentsContinuous: GetEnvironmentsContinuousManifest;
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
  GetVersionFile: GetVersionFileManifest;
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
