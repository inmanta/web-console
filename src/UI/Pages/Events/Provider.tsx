import React from "react";
import { useParams } from "react-router-dom";
import { Card } from "@patternfly/react-core";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { EventsPage } from "./EventsPage";
import { words } from "@/UI/words";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("events.title")}>
    <Card>{children}</Card>
  </PageSectionWithTitle>
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
