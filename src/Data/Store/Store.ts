import { EventsSlice, eventsSlice } from "@/Slices/Events/Data/Store";
import {
  OrderDetailsSlice,
  orderDetailsSlice,
} from "@/Slices/OrderDetails/Data/Store";
import { ordersSlice, OrdersSlice } from "@/Slices/Orders/Data/Store";
import {
  DiscoveredResourcesSlice,
  discoveredResourcesSlice,
} from "@/Slices/ResourceDiscovery/Data/Store";
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
import { factsSlice, FactsSlice } from "@S/Facts/Data/Store";
import {
  notificationSlice,
  NotificationSlice,
} from "@S/Notification/Data/Store";
import { parametersSlice, ParametersSlice } from "@S/Parameters/Data/Store";
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
} from "@S/ServiceDetails/Data/CallbacksSlice";
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
  agents: AgentsSlice;
  callbacks: CallbacksSlice;
  compileDetails: CompileDetailsSlice;
  compileReports: CompileReportsSlice;
  desiredStateDiff: DesiredStateDiffSlice;
  discoveredResources: DiscoveredResourcesSlice;
  dryRunReport: DryRunReportSlice;
  dryRuns: DryRunsSlice;
  environment: EnvironmentSlice;
  events: EventsSlice;
  facts: FactsSlice;
  instanceConfig: InstanceConfigSlice;
  instanceResources: InstanceResourcesSlice;
  notification: NotificationSlice;
  parameters: ParametersSlice;
  projects: ProjectsSlice;
  resourceDetails: ResourceDetailsSlice;
  resourceFacts: ResourceFactsSlice;
  resourceHistory: ResourceHistorySlice;
  resourceLogs: ResourceLogsSlice;
  resources: ResourcesSlice;
  serverStatus: ServerStatusSlice;
  serviceConfig: ServiceConfigSlice;
  serviceInstance: ServiceInstanceSlice;
  serviceInstances: ServiceInstancesSlice;
  services: ServicesSlice;
  orders: OrdersSlice;
  orderDetails: OrderDetailsSlice;
  versionedResourceDetails: VersionedResourceDetailsSlice;
  versionResources: VersionResourcesSlice;
}

export const storeModel: StoreModel = {
  agents: agentsSlice,
  callbacks: callbacksSlice,
  compileDetails: compileDetailsSlice,
  compileReports: compileReportsSlice,
  desiredStateDiff: desiredStateDiffSlice,
  discoveredResources: discoveredResourcesSlice,
  dryRunReport: dryRunReportSlice,
  dryRuns: dryRunsSlice,
  environment: environmentSlice,
  events: eventsSlice,
  facts: factsSlice,
  instanceConfig: instanceConfigSlice,
  instanceResources: instanceResourcesSlice,
  notification: notificationSlice,
  parameters: parametersSlice,
  projects: projectsSlice,
  resourceDetails: resourceDetailsSlice,
  resourceFacts: resourceFactsSlice,
  resourceHistory: resourceHistorySlice,
  resourceLogs: resourceLogsSlice,
  resources: resourcesSlice,
  serverStatus: serverStatusSlice,
  serviceConfig: serviceConfigSlice,
  serviceInstance: serviceInstanceSlice,
  serviceInstances: serviceInstancesSlice,
  services: servicesSlice,
  orders: ordersSlice,
  orderDetails: orderDetailsSlice,
  versionedResourceDetails: versionedResourceDetailsSlice,
  versionResources: versionResourcesSlice,
};
