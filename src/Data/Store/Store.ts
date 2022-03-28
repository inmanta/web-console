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
import { factsSlice, FactsSlice } from "@S/Facts/Data/Store";
import {
  notificationSlice,
  NotificationSlice,
} from "@S/Notification/Data/Store";
import { CallbacksSlice, callbacksSlice } from "./CallbacksSlice";
import {
  desiredStateDiffSlice,
  DesiredStateDiffSlice,
} from "./DesiredStateDiffSlice";
import { DesiredStatesSlice, desiredStatesSlice } from "./DesiredStatesSlice";
import { diagnosticsSlice, DiagnosticsSlice } from "./DiagnosticsSlice";
import { environmentSlice, EnvironmentSlice } from "./EnvironmentSlice";
import {
  InstanceConfigSlice,
  instanceConfigSlice,
} from "./InstanceConfigSlice";
import { InstanceLogsSlice, instanceLogsSlice } from "./InstanceLogsSlice";
import {
  instanceResourcesSlice,
  InstanceResourcesSlice,
} from "./InstanceResourcesSlice";
import { parametersSlice, ParametersSlice } from "./ParametersSlice";
import { projectsSlice, ProjectsSlice } from "./ProjectsSlice";
import {
  resourceDetailsSlice,
  ResourceDetailsSlice,
} from "./ResourceDetailsSlice";
import { resourceFactsSlice, ResourceFactsSlice } from "./ResourceFactsSlice";
import {
  resourceHistorySlice,
  ResourceHistorySlice,
} from "./ResourceHistorySlice";
import { resourceLogsSlice, ResourceLogsSlice } from "./ResourceLogsSlice";
import { resourcesSlice, ResourcesSlice } from "./ResourcesSlice";
import { serverStatusSlice, ServerStatusSlice } from "./ServerStatusSlice";
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
import {
  versionResourcesSlice,
  VersionResourcesSlice,
} from "./VersionResourcesSlice";
import {
  versionedResourceDetailsSlice,
  VersionedResourceDetailsSlice,
} from "./VersionedResourceDetailsSlice";

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
