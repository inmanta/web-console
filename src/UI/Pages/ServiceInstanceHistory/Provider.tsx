import React from "react";
import { useParams } from "react-router-dom";
import { ServiceProvider } from "@/UI/Components";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { Card, PageSection } from "@patternfly/react-core";
import { PageParams } from "@/UI/Routing";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection className={"horizontally-scrollable"} {...props}>
    <Card>{children}</Card>
  </PageSection>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } = useParams<PageParams<"History">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <Wrapper>
          <ServiceInstanceHistory service={service} instanceId={instance} />
        </Wrapper>
      )}
    />
  );
};
