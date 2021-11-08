import React from "react";
import { ServiceModel } from "@/Core";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { Events } from "./Events";
import { words } from "@/UI/words";
import { useRouteParams } from "@/UI/Routing";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("events.title")}>
    {children}
  </PageSectionWithTitle>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useRouteParams<"Events">();
  return (
    <Wrapper>
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
