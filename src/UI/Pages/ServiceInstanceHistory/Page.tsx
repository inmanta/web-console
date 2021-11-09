import React from "react";
import { useParams } from "react-router-dom";
import { Card } from "@patternfly/react-core";
import { RouteParams, ServiceModel } from "@/Core";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { words } from "@/UI/words";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("history.title")}>
    <Card>{children}</Card>
  </PageSectionWithTitle>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useParams<RouteParams<"History">>();
  return (
    <Wrapper>
      <ServiceInstanceHistory service={service} instanceId={instance} />
    </Wrapper>
  );
};

export const Page: React.FC = () => {
  const { service: serviceName } = useParams<RouteParams<"History">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={Wrapped}
    />
  );
};
