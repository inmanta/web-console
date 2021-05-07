import React from "react";
import { useParams } from "react-router-dom";
import { ServiceProvider } from "@/UI/Components";
import { Card, PageSection } from "@patternfly/react-core";
import { EventsPage } from "./EventsPage";
import { PageParams } from "@/UI/Routing";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection className={"horizontally-scrollable"} {...props}>
    <Card>{children}</Card>
  </PageSection>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } = useParams<PageParams<"Events">>();

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
