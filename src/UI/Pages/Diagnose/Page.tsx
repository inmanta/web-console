import React from "react";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { Diagnose } from "./Diagnose";
import { words } from "@/UI/words";
import { useRouteParams } from "@/UI/Routing";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("diagnose.title")}>
    {children}
  </PageSectionWithTitle>
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
