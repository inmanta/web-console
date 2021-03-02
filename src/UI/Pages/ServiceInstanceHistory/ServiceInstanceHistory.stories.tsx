import { ServiceInstance } from "@/Test";
import React from "react";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { ServicesContext } from "@/UI/ServicesContext";
// import { getStoreInstance } from "@/UI/Store";
import { DataProviderImpl } from "@/UI/Data";

export default {
  title: "ServiceInstanceHistory",
  component: ServiceInstanceHistory,
};

export const Default: React.FC = () => {
  const { service_entity, id, environment } = ServiceInstance.A;
  // const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([]);

  return (
    <ServicesContext.Provider value={{ dataProvider }}>
      <ServiceInstanceHistory
        service_entity={service_entity}
        instanceId={id}
        environment={environment}
      />
    </ServicesContext.Provider>
  );
};
