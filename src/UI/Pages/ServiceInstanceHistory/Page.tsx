import React from "react";
import { Card } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { PageContainer, ServiceProvider } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageContainer {...props} title={words("history.title")}>
    <Card>{children}</Card>
  </PageContainer>
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
