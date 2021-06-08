import React from "react";
import { useParams } from "react-router-dom";
import {
  ServiceProvider,
  PageSectionWithHorizontalScroll,
} from "@/UI/Components";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { Card } from "@patternfly/react-core";
import { PageParams } from "@/UI/Routing";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithHorizontalScroll {...props}>
    <Card>{children}</Card>
  </PageSectionWithHorizontalScroll>
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
