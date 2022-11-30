import React from "react";
import { ServiceModel } from "@/Core";
import { ServiceProvider } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
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

const PreppedServiceInventory: React.FC<{ service: ServiceModel }> = ({
  service,
}) => <ServiceDetails service={service} serviceName={service.name} />;
