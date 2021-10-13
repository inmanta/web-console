import { CallbacksSlice, callbacksSlice } from "./CallbacksSlice";
import { InstanceLogsSlice, instanceLogsSlice } from "./InstanceLogsSlice";
import {
  InstanceConfigSlice,
  instanceConfigSlice,
} from "./InstanceConfigSlice";
import { ProjectsSlice, projectsSlice } from "./ProjectsSlice";
import { servicesSlice, ServicesSlice } from "./ServicesSlice";
import {
  instanceResourcesSlice,
  InstanceResourcesSlice,
} from "./InstanceResourcesSlice";
import {
  serviceInstancesSlice,
  ServiceInstancesSlice,
} from "./ServiceInstancesSlice";
import { EventsSlice, eventsSlice } from "./EventsSlice";
import { diagnosticsSlice, DiagnosticsSlice } from "./DiagnosticsSlice";
import { serviceConfigSlice, ServiceConfigSlice } from "./ServiceConfigSlice";
import { resourcesSlice, ResourcesSlice } from "./ResourcesSlice";
import {
  resourceDetailsSlice,
  ResourceDetailsSlice,
} from "./ResourceDetailsSlice";
import {
  resourceHistorySlice,
  ResourceHistorySlice,
} from "./ResourceHistorySlice";
import { resourceLogsSlice, ResourceLogsSlice } from "./ResourceLogsSlice";
import {
  environmentDetailsSlice,
  EnvironmentDetailsSlice,
} from "./EnvironmentDetailsSlice";
import {
  serviceInstanceSlice,
  ServiceInstanceSlice,
} from "./ServiceInstanceSlice";
import {
  compileReportsSlice,
  CompileReportsSlice,
} from "./CompileReportsSlice";
import {
  compileDetailsSlice,
  CompileDetailsSlice,
} from "./CompileDetailsSlice";
import { serverStatusSlice, ServerStatusSlice } from "./ServerStatusSlice";

export interface StoreModel {
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
}

export const storeModel: StoreModel = {
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
};
