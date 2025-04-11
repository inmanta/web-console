import { EventsSlice, eventsSlice } from "@/Slices/Events/Data/Store";
import { OrderDetailsSlice, orderDetailsSlice } from "@/Slices/OrderDetails/Data/Store";
import { ordersSlice, OrdersSlice } from "@/Slices/Orders/Data/Store";
import { agentsSlice, AgentsSlice } from "@S/Agents/Data/Store";
import { dryRunReportSlice, DryRunReportSlice } from "@S/ComplianceCheck/Data/DryRunReportSlice";
import { dryRunsSlice, DryRunsSlice } from "@S/ComplianceCheck/Data/DryRunsSlice";
import { factsSlice, FactsSlice } from "@S/Facts/Data/Store";
import { parametersSlice, ParametersSlice } from "@S/Parameters/Data/Store";
import { CallbacksSlice, callbacksSlice } from "@S/ServiceDetails/Data/CallbacksSlice";
import { serverStatusSlice, ServerStatusSlice } from "@S/Status/Data/Store";
import { environmentSlice, EnvironmentSlice } from "./EnvironmentSlice";
import { projectsSlice, ProjectsSlice } from "./ProjectsSlice";

export interface StoreModel {
  agents: AgentsSlice;
  callbacks: CallbacksSlice;
  dryRunReport: DryRunReportSlice;
  dryRuns: DryRunsSlice;
  environment: EnvironmentSlice;
  events: EventsSlice;
  facts: FactsSlice;
  parameters: ParametersSlice;
  projects: ProjectsSlice;
  serverStatus: ServerStatusSlice;
  orders: OrdersSlice;
  orderDetails: OrderDetailsSlice;
}

export const storeModel: StoreModel = {
  agents: agentsSlice,
  callbacks: callbacksSlice,
  dryRunReport: dryRunReportSlice,
  dryRuns: dryRunsSlice,
  environment: environmentSlice,
  events: eventsSlice,
  facts: factsSlice,
  parameters: parametersSlice,
  projects: projectsSlice,
  serverStatus: serverStatusSlice,
  orders: ordersSlice,
  orderDetails: orderDetailsSlice,
};
