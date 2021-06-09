import React from "react";
import { useParams } from "react-router-dom";
import {
  ServiceProvider,
  PageSectionWithHorizontalScroll,
} from "@/UI/Components";
import { Card } from "@patternfly/react-core";
import { PageParams } from "@/UI/Routing/Page";
import { EventsPage } from "./EventsPage";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithHorizontalScroll {...props}>
    <Card>{children}</Card>
  </PageSectionWithHorizontalScroll>
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
