import React from "react";
import { ServiceModel } from "@inmanta/web-console-core";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { ServiceProvider } from "@inmanta/web-console-feature-lsm/Components/ServiceProvider";
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
