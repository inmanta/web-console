import React from "react";
import { ServiceModel } from "@/Core";
import { ServiceProvider } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { Chart } from "./Components";
import { ServiceInventory } from "./ServiceInventory";
import { Wrapper } from "./Wrapper";

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"Inventory">();
  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={PreppedServiceInventory}
    />
  );
};

const PreppedServiceInventory: React.FC<{ service: ServiceModel }> = ({
  service,
}) => (
  <ServiceInventory
    service={service}
    serviceName={service.name}
    intro={<Chart summary={service.instance_summary} />}
  />
);
