import React from "react";
import { PageContainer, ServiceProvider } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Diagnose } from "./Diagnose";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageContainer {...props} title={words("diagnose.title")}>
    {children}
  </PageContainer>
);

export const Page: React.FC = () => {
  const { service: serviceName, instance } = useRouteParams<"Diagnose">();

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
