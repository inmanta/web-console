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
import {
  latestReleasedResourcesSlice,
  LatestReleasedResourcesSlice,
} from "./LatestReleasedResourcesSlice";

export interface StoreModel {
  projects: ProjectsSlice;
  services: ServicesSlice;
  serviceInstances: ServiceInstancesSlice;
  serviceConfig: ServiceConfigSlice;
  instanceResources: InstanceResourcesSlice;
  events: EventsSlice;
  instanceLogs: InstanceLogsSlice;
  instanceConfig: InstanceConfigSlice;
  diagnostics: DiagnosticsSlice;
  latestReleasedResources: LatestReleasedResourcesSlice;
}

export const storeModel: StoreModel = {
  projects: projectsSlice,
  services: servicesSlice,
  serviceInstances: serviceInstancesSlice,
  serviceConfig: serviceConfigSlice,
  instanceLogs: instanceLogsSlice,
  instanceConfig: instanceConfigSlice,
  instanceResources: instanceResourcesSlice,
  events: eventsSlice,
  diagnostics: diagnosticsSlice,
  latestReleasedResources: latestReleasedResourcesSlice,
};
