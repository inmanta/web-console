import { createContext } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";

/**
 * The InstanceProviderInterface
 * Reflects the InstanceDetailsContext.
 */
interface InstanceProviderInterface {
  instance: ServiceInstanceModel;
  logsQuery: UseQueryResult<InstanceLog[], Error>;
  serviceModelQuery: UseQueryResult<ServiceModel, Error>;
}

/**
 * IntstanceDetailsContext
 * Should be used to provide context to the InstanceDetails page.
 * The logsQuery contains both the events and history data.
 */
export const InstanceDetailsContext = createContext<InstanceProviderInterface>({
  instance: {} as ServiceInstanceModel,
  logsQuery: {} as UseQueryResult<InstanceLog[], Error>,
  serviceModelQuery: {} as UseQueryResult<ServiceModel, Error>,
});
