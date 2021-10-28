import React from "react";
import { useParams } from "react-router-dom";
import { RouteParams, ServiceModel } from "@/Core";
import { ServiceProvider } from "@/UI/Components";
import { Chart } from "./Components";
import { ServiceInventory } from "./ServiceInventory";
import { Wrapper } from "./Wrapper";

export const Page: React.FC = () => {
  const { service: serviceName } = useParams<RouteParams<"Inventory">>();

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
