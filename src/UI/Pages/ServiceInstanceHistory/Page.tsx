import React from "react";
import { Card } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { words } from "@/UI/words";
import { useRouteParams } from "@/UI/Routing";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("history.title")}>
    <Card>{children}</Card>
  </PageSectionWithTitle>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useRouteParams<"History">();
  return (
    <Wrapper>
      <ServiceInstanceHistory service={service} instanceId={instance} />
    </Wrapper>
  );
};

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"History">();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={Wrapped}
    />
  );
};
