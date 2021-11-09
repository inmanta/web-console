import React from "react";
import { useParams } from "react-router-dom";
import { RouteParams, ServiceModel } from "@/Core";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { words } from "@/UI/words";
import { Events } from "./Events";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("events.title")}>
    {children}
  </PageSectionWithTitle>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useParams<RouteParams<"Events">>();
  return (
    <Wrapper>
      <Events service={service} instanceId={instance} />
    </Wrapper>
  );
};

export const Page: React.FC = () => {
  const { service: serviceName } = useParams<RouteParams<"Events">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={Wrapped}
    />
  );
};
