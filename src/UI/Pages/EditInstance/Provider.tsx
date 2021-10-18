import React from "react";
import { useParams } from "react-router-dom";
import { words } from "@/UI/words";
import { Route } from "@/UI/Routing";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { EditInstancePage } from "./EditInstancePage";

const PageWrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle
    {...props}
    title={words("inventory.editInstance.title")}
  >
    {children}
  </PageSectionWithTitle>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } =
    useParams<Route.Params<"EditInstance">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ service }) => (
        <PageWrapper>
          <EditInstancePage serviceEntity={service} instanceId={instance} />
        </PageWrapper>
      )}
    />
  );
};
