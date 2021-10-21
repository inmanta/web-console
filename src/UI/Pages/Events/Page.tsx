import React from "react";
import { useParams } from "react-router-dom";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { Route } from "@/UI/Routing";
import { Events } from "./Events";
import { words } from "@/UI/words";
import { ServiceModel } from "@/Core";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("events.title")}>
    {children}
  </PageSectionWithTitle>
);

const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useParams<Route.Params<"Events">>();
  return (
    <Wrapper>
      <Events service={service} instanceId={instance} />
    </Wrapper>
  );
};

export const Page: React.FC = () => {
  const { service: serviceName } = useParams<Route.Params<"Events">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={Wrapped}
    />
  );
};
