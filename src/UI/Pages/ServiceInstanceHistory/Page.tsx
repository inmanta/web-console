import React from "react";
import { useParams } from "react-router-dom";
import { Card } from "@patternfly/react-core";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { words } from "@/UI/words";
import { ServiceModel } from "@/Core";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("history.title")}>
    <Card>{children}</Card>
  </PageSectionWithTitle>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useParams<Route.Params<"History">>();
  return (
    <Wrapper>
      <ServiceInstanceHistory service={service} instanceId={instance} />
    </Wrapper>
  );
};

export const Page: React.FC = () => {
  const { service: serviceName } = useParams<Route.Params<"History">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={Wrapped}
    />
  );
};
