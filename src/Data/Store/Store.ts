import { agentProcessSlice, AgentProcessSlice } from "./AgentProcessSlice";
import { agentsSlice, AgentsSlice } from "./AgentsSlice";
import { CallbacksSlice, callbacksSlice } from "./CallbacksSlice";
import {
  compileDetailsSlice,
  CompileDetailsSlice,
} from "./CompileDetailsSlice";
import {
  compileReportsSlice,
  CompileReportsSlice,
} from "./CompileReportsSlice";
import { diagnosticsSlice, DiagnosticsSlice } from "./DiagnosticsSlice";
import {
  environmentDetailsSlice,
  EnvironmentDetailsSlice,
} from "./EnvironmentDetailsSlice";
import {
  environmentSettingsSlice,
  EnvironmentSettingsSlice,
} from "./EnvironmentSettingsSlice";
import { EnvironmentsSlice, environmentsSlice } from "./EnvironmentsSlice";
import { EventsSlice, eventsSlice } from "./EventsSlice";
import { factsSlice, FactsSlice } from "./FactsSlice";
import {
  InstanceConfigSlice,
  instanceConfigSlice,
} from "./InstanceConfigSlice";
import { InstanceLogsSlice, instanceLogsSlice } from "./InstanceLogsSlice";
import {
  instanceResourcesSlice,
  InstanceResourcesSlice,
} from "./InstanceResourcesSlice";
import { projectsSlice, ProjectsSlice } from "./ProjectsSlice";
import {
  resourceDetailsSlice,
  ResourceDetailsSlice,
} from "./ResourceDetailsSlice";
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

export interface StoreModel {
  environments: EnvironmentsSlice;
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
  environmentDetails: EnvironmentDetailsSlice;
  callbacks: CallbacksSlice;
  compileReports: CompileReportsSlice;
  compileDetails: CompileDetailsSlice;
  environmentSettings: EnvironmentSettingsSlice;
  facts: FactsSlice;
  agents: AgentsSlice;
  agentProcess: AgentProcessSlice;
}

export const storeModel: StoreModel = {
  environments: environmentsSlice,
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
  environmentDetails: environmentDetailsSlice,
  callbacks: callbacksSlice,
  compileReports: compileReportsSlice,
  compileDetails: compileDetailsSlice,
  environmentSettings: environmentSettingsSlice,
  facts: factsSlice,
  agents: agentsSlice,
  agentProcess: agentProcessSlice,
};
