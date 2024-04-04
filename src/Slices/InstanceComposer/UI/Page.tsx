import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer, ServicesProvider } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const Page = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();
  const { featureManager } = useContext(DependencyContext);
  return featureManager.isComposerEnabled() ? (
    <ServicesProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ services, mainServiceName }) => (
        <PageWrapper>
          <Canvas
            services={services}
            mainServiceName={mainServiceName}
            editable
          />
        </PageWrapper>
      )}
    />
  ) : (
    <EmptyView
      message={words("inventory.instanceComposer.disabled")}
      aria-label="ComposersView-Empty"
    />
  );
};

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer
    aria-label="Composer"
    {...props}
    title={words("inventory.instanceComposer.title")}
  >
    {children}
  </PageContainer>
);
