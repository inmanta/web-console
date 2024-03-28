import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer, ServicesProvider } from "@/UI/Components";
import { InstanceProvider } from "./InstanceProvider";

export const Page = () => {
  const { service: serviceName, instance: instance } =
    useRouteParams<"InstanceComposerEditor">();
  const { featureManager } = useContext(DependencyContext);

  return featureManager.isComposerEnabled() ? (
    <ServicesProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ services, mainServiceName }) => (
        <PageWrapper>
          <InstanceProvider
            services={services}
            mainServiceName={mainServiceName}
            instanceId={instance}
          />
        </PageWrapper>
      )}
    />
  ) : (
    <EmptyView
      message={words("inventory.instanceComposer.disabled")}
      aria-label="OrdersView-Empty"
    />
  );
};

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer
    {...props}
    title={words("inventory.instanceComposer.title.edit")}
  >
    {children}
  </PageContainer>
);
