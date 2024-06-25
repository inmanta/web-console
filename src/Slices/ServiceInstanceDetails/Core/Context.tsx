import { createContext } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";

interface InstanceProviderInterface {
  instance: ServiceInstanceModel;
  logsQuery: UseQueryResult<InstanceLog[], Error>;
  serviceModelQuery: UseQueryResult<ServiceModel, Error>;
}

export const InstanceContext = createContext<InstanceProviderInterface>({
  instance: {} as ServiceInstanceModel,
  logsQuery: {} as UseQueryResult<InstanceLog[], Error>,
  serviceModelQuery: {} as UseQueryResult<ServiceModel, Error>,
});
