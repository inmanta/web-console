import { EventsSlice, eventsSlice } from "@/Slices/Events/Data/Store";
import {
  agentProcessSlice,
  AgentProcessSlice,
} from "@S/AgentProcess/Data/Store";
import { agentsSlice, AgentsSlice } from "@S/Agents/Data/Store";
import {
  compileDetailsSlice,
  CompileDetailsSlice,
} from "@S/CompileDetails/Data/Store";
import {
  compileReportsSlice,
  CompileReportsSlice,
} from "@S/CompileReports/Data/Store";
import {
  dryRunReportSlice,
  DryRunReportSlice,
} from "@S/ComplianceCheck/Data/DryRunReportSlice";
import {
  dryRunsSlice,
  DryRunsSlice,
} from "@S/ComplianceCheck/Data/DryRunsSlice";
import {
  DesiredStatesSlice,
  desiredStatesSlice,
} from "@S/DesiredState/Data/Store";
import {
  desiredStateDiffSlice,
  DesiredStateDiffSlice,
} from "@S/DesiredStateCompare/Data/Store";
import {
  versionResourcesSlice,
  VersionResourcesSlice,
} from "@S/DesiredStateDetails/Data/Store";
import {
  versionedResourceDetailsSlice,
  VersionedResourceDetailsSlice,
} from "@S/DesiredStateResourceDetails/Data/Store";
import { diagnosticsSlice, DiagnosticsSlice } from "@S/Diagnose/Data/Store";
import { factsSlice, FactsSlice } from "@S/Facts/Data/Store";
import {
  notificationSlice,
  NotificationSlice,
} from "@S/Notification/Data/Store";
import {
  resourceDetailsSlice,
  ResourceDetailsSlice,
} from "@S/ResourceDetails/Data/ResourceDetailsSlice";
import {
  resourceFactsSlice,
  ResourceFactsSlice,
} from "@S/ResourceDetails/Data/ResourceFactsSlice";
import {
  resourceHistorySlice,
  ResourceHistorySlice,
} from "@S/ResourceDetails/Data/ResourceHistorySlice";
import {
  resourceLogsSlice,
  ResourceLogsSlice,
} from "@S/ResourceDetails/Data/ResourceLogsSlice";
import {
  CallbacksSlice,
  callbacksSlice,
} from "@S/ServiceCatalog/Data/CallbacksSlice";
import {
  InstanceLogsSlice,
  instanceLogsSlice,
} from "@S/ServiceInstanceHistory/Data/Store";
import { serverStatusSlice, ServerStatusSlice } from "@S/Status/Data/Store";
import { environmentSlice, EnvironmentSlice } from "./EnvironmentSlice";
import {
  InstanceConfigSlice,
  instanceConfigSlice,
} from "./InstanceConfigSlice";
import {
  instanceResourcesSlice,
  InstanceResourcesSlice,
} from "./InstanceResourcesSlice";
import { parametersSlice, ParametersSlice } from "./ParametersSlice";
import { projectsSlice, ProjectsSlice } from "./ProjectsSlice";
import { resourcesSlice, ResourcesSlice } from "./ResourcesSlice";
import { serviceConfigSlice, ServiceConfigSlice } from "./ServiceConfigSlice";
import {
  serviceInstanceSlice,
  ServiceInstanceSlice,
} from "./ServiceInstanceSlice";
import {
  serviceInstancesSlice,
  ServiceInstancesSlice,
} from "./ServiceInstancesSlice";
import { servicesSlice, ServicesSlice } from "./ServicesSlice";

export interface StoreModel {
  environment: EnvironmentSlice;
  projects: ProjectsSlice;
  serverStatus: ServerStatusSlice;
  services: ServicesSlice;
  serviceInstances: ServiceInstancesSlice;
  serviceInstance: ServiceInstanceSlice;
  serviceConfig: ServiceConfigSlice;
  instanceResources: InstanceResourcesSlice;
  events: EventsSlice;
  instanceLogs: InstanceLogsSlice;
  instanceConfig: InstanceConfigSlice;
  diagnostics: DiagnosticsSlice;
  resources: ResourcesSlice;
  resourceDetails: ResourceDetailsSlice;
  resourceHistory: ResourceHistorySlice;
  resourceLogs: ResourceLogsSlice;
  callbacks: CallbacksSlice;
  compileReports: CompileReportsSlice;
  compileDetails: CompileDetailsSlice;
  resourceFacts: ResourceFactsSlice;
  agents: AgentsSlice;
  agentProcess: AgentProcessSlice;
  desiredStates: DesiredStatesSlice;
  versionResources: VersionResourcesSlice;
  parameters: ParametersSlice;
  facts: FactsSlice;
  desiredStateDiff: DesiredStateDiffSlice;
  dryRuns: DryRunsSlice;
  dryRunReport: DryRunReportSlice;
  versionedResourceDetails: VersionedResourceDetailsSlice;
  notification: NotificationSlice;
}

export const storeModel: StoreModel = {
  environment: environmentSlice,
  projects: projectsSlice,
  serverStatus: serverStatusSlice,
  services: servicesSlice,
  serviceInstances: serviceInstancesSlice,
  serviceInstance: serviceInstanceSlice,
  serviceConfig: serviceConfigSlice,
  instanceLogs: instanceLogsSlice,
  instanceConfig: instanceConfigSlice,
  instanceResources: instanceResourcesSlice,
  events: eventsSlice,
  diagnostics: diagnosticsSlice,
  resources: resourcesSlice,
  resourceDetails: resourceDetailsSlice,
  resourceHistory: resourceHistorySlice,
  resourceLogs: resourceLogsSlice,
  callbacks: callbacksSlice,
  compileReports: compileReportsSlice,
  compileDetails: compileDetailsSlice,
  resourceFacts: resourceFactsSlice,
  agents: agentsSlice,
  agentProcess: agentProcessSlice,
  desiredStates: desiredStatesSlice,
  versionResources: versionResourcesSlice,
  parameters: parametersSlice,
  facts: factsSlice,
  desiredStateDiff: desiredStateDiffSlice,
  dryRuns: dryRunsSlice,
  dryRunReport: dryRunReportSlice,
  versionedResourceDetails: versionedResourceDetailsSlice,
  notification: notificationSlice,
};
