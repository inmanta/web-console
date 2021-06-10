import React from "react";
import { useParams } from "react-router-dom";
import { PageSection } from "@patternfly/react-core";
import { ServiceProvider } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { Diagnose } from "./Diagnose";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection {...props}>{children}</PageSection>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } =
    useParams<Route.Params<"Diagnose">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <Wrapper>
          <Diagnose service={service} instanceId={instance} />
        </Wrapper>
      )}
    />
  );
};
