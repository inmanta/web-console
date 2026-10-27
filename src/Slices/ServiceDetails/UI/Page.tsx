import React from "react";
import { ServiceProvider } from "@/UI/Components/ServiceProvider";
import { ServiceModel } from "@inmanta/web-console-core";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { ServiceDetails } from "./ServiceDetails";
import { Wrapper } from "./Wrapper";

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"ServiceDetails">();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={PreppedServiceInventory}
    />
  );
};

const PreppedServiceInventory: React.FC<{ service: ServiceModel }> = ({ service }) => (
  <ServiceDetails service={service} serviceName={service.name} />
);
