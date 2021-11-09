import React from "react";
import { useParams } from "react-router-dom";
import { RouteParams } from "@/Core";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { words } from "@/UI/words";
import { Diagnose } from "./Diagnose";

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
