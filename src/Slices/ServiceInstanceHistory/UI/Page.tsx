import React from "react";
import { ServiceModel } from "@/Core";
import {
  PageContainer,
  ServiceInstanceDescription,
  ServiceProvider,
} from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer {...props} title={words("history.title")}>
    {children}
  </PageContainer>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useRouteParams<"History">();
  return (
    <Wrapper>
      <ServiceInstanceDescription
        instanceId={instance}
        serviceName={service.name}
        getDescription={words("history.caption")}
        withSpace
      />
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
