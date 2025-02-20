import { createContext } from "react";
import { UseInfiniteQueryResult, UseQueryResult } from "@tanstack/react-query";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";

/**
 * The InstanceProviderInterface
 * Reflects the InstanceDetailsContext.
 */
interface InstanceProviderInterface {
  instance: ServiceInstanceModel;
  logsQuery: UseInfiniteQueryResult<InstanceLog[], Error>;
  serviceModelQuery: UseQueryResult<ServiceModel, Error>;
}

/**
 * InstanceDetailsContext
 * Should be used to provide context to the InstanceDetails page.
 * The logsQuery contains both the events and history data.
 */
export const InstanceDetailsContext = createContext<InstanceProviderInterface>({
  instance: {} as ServiceInstanceModel,
  logsQuery: {} as UseInfiniteQueryResult<InstanceLog[], Error>,
  serviceModelQuery: {} as UseQueryResult<ServiceModel, Error>,
});
