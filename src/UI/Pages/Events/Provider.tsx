import React from "react";
import { useParams } from "react-router-dom";
import { EnvironmentProvider, ServiceProvider } from "@/UI/Components";
import { Card, PageSection } from "@patternfly/react-core";
import { EventsPage } from "./EventsPage";

interface Params {
  id: string;
  instanceId: string;
}

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection className={"horizontally-scrollable"} {...props}>
    <Card>{children}</Card>
  </PageSection>
);

export const Provider: React.FC = () => {
  const { id, instanceId } = useParams<Params>();

  return (
    <EnvironmentProvider
      Wrapper={Wrapper}
      Dependant={({ environment }) => (
        <ServiceProvider
          serviceName={id}
          Wrapper={Wrapper}
          Dependant={({ service }) => (
            <Wrapper>
              <EventsPage
                service={service}
                instanceId={instanceId}
                environment={environment}
              />
            </Wrapper>
          )}
        />
      )}
    />
  );
};
