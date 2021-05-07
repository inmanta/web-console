import React from "react";
import { useParams } from "react-router-dom";
import { ServiceProvider } from "@/UI/Components";
import { PageSection } from "@patternfly/react-core";
import { Diagnose } from "./Diagnose";
import { PageParams } from "@/UI/Routing";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection className={"horizontally-scrollable"} {...props}>
    {children}
  </PageSection>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } = useParams<
    PageParams<"Diagnose">
  >();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <Wrapper>
          <Diagnose service={service} instanceId={instance} />
        </Wrapper>
      )}
    />
  );
};
