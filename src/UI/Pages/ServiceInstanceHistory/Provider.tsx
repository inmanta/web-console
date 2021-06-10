import React from "react";
import { useParams } from "react-router-dom";
import { Card } from "@patternfly/react-core";
import {
  ServiceProvider,
  PageSectionWithHorizontalScroll,
} from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithHorizontalScroll {...props}>
    <Card>{children}</Card>
  </PageSectionWithHorizontalScroll>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } =
    useParams<Route.Params<"History">>();

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
