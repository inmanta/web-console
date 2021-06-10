import React from "react";
import { useParams } from "react-router-dom";
import { Card, PageSection } from "@patternfly/react-core";
import { ServiceProvider } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { EventsPage } from "./EventsPage";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection {...props}>
    <Card>{children}</Card>
  </PageSection>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } =
    useParams<Route.Params<"Events">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <Wrapper>
          <EventsPage service={service} instanceId={instance} />
        </Wrapper>
      )}
    />
  );
};
