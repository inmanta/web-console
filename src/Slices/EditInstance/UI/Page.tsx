import React from "react";
import { PageContainer, ServiceProvider } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { EditInstancePage } from "./EditInstancePage";

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer {...props} title={words("inventory.editInstance.title")}>
    {children}
  </PageContainer>
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
