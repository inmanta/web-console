import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer, ServicesProvider } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

/**
 * Renders the Page component for the Instance Composer Page.
 * If the composer feature is enabled, it renders the Canvas component wrapped in a ServicesProvider.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 */
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

/**
 * Wrapper component for the Page component.
 * Renders the PageContainer component with the provided props and children.
 */
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
