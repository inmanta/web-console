import React from "react";
import { useParams } from "react-router-dom";
import { ServiceProvider } from "@/UI/Components";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { Card, PageSection } from "@patternfly/react-core";

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
    <ServiceProvider
      serviceName={id}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <Wrapper>
          <ServiceInstanceHistory service={service} instanceId={instanceId} />
        </Wrapper>
      )}
    />
  );
};
