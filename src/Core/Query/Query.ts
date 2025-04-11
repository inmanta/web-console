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
  GetEnvironments,
  GetEnvironmentsManifest,
} from "@/Data/Managers/GetEnvironments/interface";
import {
  GetEnvironmentsContinuous,
  GetEnvironmentsContinuousManifest,
} from "@/Data/Managers/GetEnvironmentsContinuous/interface";
import {
  GetServerStatus,
  GetServerStatusManifest,
} from "@/Data/Managers/GetServerStatus/interface";
import { GetVersionFile, GetVersionFileManifest } from "@/Data/Managers/GetVersionFile/interface";
import * as GetAgents from "@S/Agents/Core/Query";
import * as GetDryRunReport from "@S/ComplianceCheck/Core/DryRunReportQuery";
import * as GetDryRuns from "@S/ComplianceCheck/Core/DryRunsQuery";
import * as GetMetrics from "@S/Dashboard/Core/Query";
import * as GetDiagnostics from "@S/Diagnose/Core/Query";
import * as GetInstanceEvents from "@S/Events/Core/Query";
import * as GetFacts from "@S/Facts/Core/Query";
import * as GetOrderDetails from "@S/OrderDetails/Core/Query";
import * as GetOrders from "@S/Orders/Core/Query";
import * as GetParameters from "@S/Parameters/Core/Query";
import * as GetResourceHistory from "@S/ResourceDetails/Core/GetResourceHistoryQuery";
import * as GetResourceLogs from "@S/ResourceDetails/Core/GetResourceLogsQuery";
import * as GetCallbacks from "@S/ServiceDetails/Core/GetCallbacksQuery";
import * as GetEnvironmentDetails from "@S/Settings/Core/GetEnvironmentDetailsQuery";
import * as GetProjects from "@S/Settings/Core/GetProjectsQuery";

export type Query =
  | GetInstanceEvents.Query
  | GetMetrics.Query
  | GetDiagnostics.Query
  | GetProjects.Query
  | GetResourceHistory.Query
  | GetResourceLogs.Query
  | GetOrders.Query
  | GetOrderDetails.Query
  | GetEnvironmentDetails.Query
  | GetServerStatus
  | GetCallbacks.Query
  | GetEnvironmentSettings
  | GetEnvironmentSetting
  | GetEnvironments
  | GetEnvironmentsContinuous
  | GetFacts.Query
  | GetAgents.Query
  | GetParameters.Query
  | GetDryRuns.Query
  | GetDryRunReport.Query
  | GetVersionFile;

export type Type = Query;

/**
 * The Manifest is just a utility that collects all the different
 * types related to all the sub queries.
 */
interface Manifest {
  GetInstanceEvents: GetInstanceEvents.Manifest;
  GetDiagnostics: GetDiagnostics.Manifest;
  GetMetrics: GetMetrics.Manifest;
  GetProjects: GetProjects.Manifest;
  GetServerStatus: GetServerStatusManifest;
  GetResourceHistory: GetResourceHistory.Manifest;
  GetResourceLogs: GetResourceLogs.Manifest;
  GetOrders: GetOrders.Manifest;
  GetOrderDetails: GetOrderDetails.Manifest;
  GetEnvironmentDetails: GetEnvironmentDetails.Manifest;
  GetCallbacks: GetCallbacks.Manifest;
  GetEnvironmentSettings: GetEnvironmentSettingsManifest;
  GetEnvironmentSetting: GetEnvironmentSettingManifest;
  GetEnvironments: GetEnvironmentsManifest;
  GetEnvironmentsContinuous: GetEnvironmentsContinuousManifest;
  GetAgents: GetAgents.Manifest;
  GetParameters: GetParameters.Manifest;
  GetFacts: GetFacts.Manifest;
  GetDryRuns: GetDryRuns.Manifest;
  GetDryRunReport: GetDryRunReport.Manifest;
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
export type UsedApiData<K extends Kind> = RemoteData.RemoteData<Error<K>, UsedData<K>>;
