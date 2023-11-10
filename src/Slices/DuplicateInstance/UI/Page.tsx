import React from "react";
import { useRouteParams } from "@/UI";
import { PageContainer, ServiceProvider } from "@/UI/Components";
import { words } from "@/UI/words";
import { DuplicateInstancePage } from "./DuplicateInstancePage";

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer {...props} title={words("inventory.editInstance.title")}>
    {children}
  </PageContainer>
);

export const Page: React.FC = () => {
  const { service: serviceName, instance } =
    useRouteParams<"DuplicateInstance">();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ service }) => (
        <PageWrapper>
          <DuplicateInstancePage
            serviceEntity={service}
            instanceId={instance}
          />
        </PageWrapper>
      )}
    />
  );
};
