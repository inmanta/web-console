import React from "react";
import { useParams } from "react-router-dom";
import { RouteParams } from "@/Core";
import { words } from "@/UI/words";
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

export const Page: React.FC = () => {
  const { service: serviceName, instance } =
    useParams<RouteParams<"EditInstance">>();

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
