import React from "react";
import { ServiceModel } from "@/Core";
import {
  PageContainer,
  ServiceInstanceDescription,
  ServiceProvider,
} from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Events } from "./Events";

const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer {...props} title={words("events.title")}>
    {children}
  </PageContainer>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useRouteParams<"Events">();
  return (
    <Wrapper>
      <ServiceInstanceDescription
        instanceId={instance}
        getDescription={words("events.caption")}
        serviceName={service.name}
      />
      <Events service={service} instanceId={instance} />
    </Wrapper>
  );
};

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"Events">();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={Wrapped}
    />
  );
};
