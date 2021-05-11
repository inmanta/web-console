import { InstanceLogsSlice, instanceLogsSlice } from "./InstanceLogsSlice";
import {
  InstanceConfigSlice,
  instanceConfigSlice,
} from "./InstanceConfigSlice";
import { ProjectsSlice, projectsSlice } from "./ProjectsSlice";
import { servicesSlice, ServicesSlice } from "./ServicesSlice";
import { resourcesSlice, ResourcesSlice } from "./ResourcesSlice";
import {
  serviceInstancesSlice,
  ServiceInstancesSlice,
} from "./ServiceInstancesSlice";
import { EventsSlice, eventsSlice } from "./EventsSlice";
import { diagnosticsSlice, DiagnosticsSlice } from "./DiagnosticsSlice";

export interface StoreModel {
  resources: ResourcesSlice;
  events: EventsSlice;
  services: ServicesSlice;
  instanceLogs: InstanceLogsSlice;
  instanceConfig: InstanceConfigSlice;
  projects: ProjectsSlice;
  serviceInstances: ServiceInstancesSlice;
  diagnostics: DiagnosticsSlice;
}

export const storeModel: StoreModel = {
  instanceLogs: instanceLogsSlice,
  instanceConfig: instanceConfigSlice,
  projects: projectsSlice,
  resources: resourcesSlice,
  events: eventsSlice,
  serviceInstances: serviceInstancesSlice,
  services: servicesSlice,
  diagnostics: diagnosticsSlice,
};
