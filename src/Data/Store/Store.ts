import { EventsSlice, eventsSlice } from "@/Slices/Events/Data/Store";
import { OrderDetailsSlice, orderDetailsSlice } from "@/Slices/OrderDetails/Data/Store";
import { ordersSlice, OrdersSlice } from "@/Slices/Orders/Data/Store";
import { agentsSlice, AgentsSlice } from "@S/Agents/Data/Store";
import { dryRunReportSlice, DryRunReportSlice } from "@S/ComplianceCheck/Data/DryRunReportSlice";
import { dryRunsSlice, DryRunsSlice } from "@S/ComplianceCheck/Data/DryRunsSlice";
import { factsSlice, FactsSlice } from "@S/Facts/Data/Store";
import { parametersSlice, ParametersSlice } from "@S/Parameters/Data/Store";
import { CallbacksSlice, callbacksSlice } from "@S/ServiceDetails/Data/CallbacksSlice";

export interface StoreModel {
  agents: AgentsSlice;
  callbacks: CallbacksSlice;
  dryRunReport: DryRunReportSlice;
  dryRuns: DryRunsSlice;
  events: EventsSlice;
  facts: FactsSlice;
  parameters: ParametersSlice;
  orders: OrdersSlice;
  orderDetails: OrderDetailsSlice;
}

export const storeModel: StoreModel = {
  agents: agentsSlice,
  callbacks: callbacksSlice,
  dryRunReport: dryRunReportSlice,
  dryRuns: dryRunsSlice,
  events: eventsSlice,
  facts: factsSlice,
  parameters: parametersSlice,
  orders: ordersSlice,
  orderDetails: orderDetailsSlice,
};
