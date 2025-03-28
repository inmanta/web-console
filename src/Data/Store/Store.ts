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
import { resourcesSlice, ResourcesSlice } from "./ResourcesSlice";

export interface StoreModel {
  agents: AgentsSlice;
  callbacks: CallbacksSlice;
  desiredStateDiff: DesiredStateDiffSlice;
  discoveredResources: DiscoveredResourcesSlice;
  dryRunReport: DryRunReportSlice;
  dryRuns: DryRunsSlice;
  events: EventsSlice;
  facts: FactsSlice;
  parameters: ParametersSlice;
  resourceDetails: ResourceDetailsSlice;
  resourceFacts: ResourceFactsSlice;
  resourceHistory: ResourceHistorySlice;
  resourceLogs: ResourceLogsSlice;
  resources: ResourcesSlice;
  orders: OrdersSlice;
  orderDetails: OrderDetailsSlice;
  versionedResourceDetails: VersionedResourceDetailsSlice;
  versionResources: VersionResourcesSlice;
}

export const storeModel: StoreModel = {
  agents: agentsSlice,
  callbacks: callbacksSlice,
  desiredStateDiff: desiredStateDiffSlice,
  discoveredResources: discoveredResourcesSlice,
  dryRunReport: dryRunReportSlice,
  dryRuns: dryRunsSlice,
  events: eventsSlice,
  facts: factsSlice,
  parameters: parametersSlice,
  resourceDetails: resourceDetailsSlice,
  resourceFacts: resourceFactsSlice,
  resourceHistory: resourceHistorySlice,
  resourceLogs: resourceLogsSlice,
  resources: resourcesSlice,
  orders: ordersSlice,
  orderDetails: orderDetailsSlice,
  versionedResourceDetails: versionedResourceDetailsSlice,
  versionResources: versionResourcesSlice,
};
