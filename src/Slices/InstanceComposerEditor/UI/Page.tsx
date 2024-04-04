import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer, ServicesProvider } from "@/UI/Components";
import { InstanceProvider } from "@/UI/Components/InstanceProvider";

export const Page = () => {
  const { service: serviceName, instance } =
    useRouteParams<"InstanceComposerEditor">();
  const { featureManager } = useContext(DependencyContext);
  return featureManager.isComposerEnabled() ? (
    <ServicesProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ services, mainServiceName }) => (
        <PageWrapper>
          <InstanceProvider
            label={words("inventory.instanceComposer.title.edit")}
            services={services}
            mainServiceName={mainServiceName}
            instanceId={instance}
            editable={true}
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
