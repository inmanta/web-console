import React from "react";
import { useParams } from "react-router-dom";
import { ServiceProvider } from "@/UI/Components";
import { PageSection } from "@patternfly/react-core";
import { Diagnose } from "./Diagnose";

interface Params {
  id: string;
  instanceId: string;
}

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSection className={"horizontally-scrollable"} {...props}>
    {children}
  </PageSection>
);

export const Provider: React.FC = () => {
  const { id, instanceId } = useParams<Params>();

  return (
    <ServiceProvider
      serviceName={id}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <Wrapper>
          <Diagnose service={service} instanceId={instanceId} />
        </Wrapper>
      )}
    />
  );
};
