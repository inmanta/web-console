import React from "react";
import { words } from "@/UI/words";
import { PageSectionWithTitle, ServiceProvider } from "@/UI/Components";
import { EditInstancePage } from "./EditInstancePage";
import { useRouteParams } from "@/UI/Routing";

const PageWrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle
    {...props}
    title={words("inventory.editInstance.title")}
  >
    {children}
  </PageSectionWithTitle>
);

export const Page: React.FC = () => {
  const { service: serviceName, instance } = useRouteParams<"EditInstance">();

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
