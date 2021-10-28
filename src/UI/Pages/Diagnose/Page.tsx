import React from "react";
import { useParams } from "react-router-dom";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { Diagnose } from "./Diagnose";
import { words } from "@/UI/words";
import { RouteParams } from "@/Core";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("diagnose.title")}>
    {children}
  </PageSectionWithTitle>
);

export const Page: React.FC = () => {
  const { service: serviceName, instance } =
    useParams<RouteParams<"Diagnose">>();

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
