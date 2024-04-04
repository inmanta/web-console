import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer, ServicesProvider } from "@/UI/Components";
import { InstanceProvider } from "@/UI/Components/InstanceProvider";

/**
 * Renders the Page component for the Instance Composer Viewer Page.
 * If the composer feature is enabled, it renders the Canvas component wrapped in a ServicesProvider.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 */
export const Page = () => {
  const { service: serviceName, instance } =
    useRouteParams<"InstanceComposerViewer">();
  const { featureManager } = useContext(DependencyContext);
  return featureManager.isComposerEnabled() ? (
    <ServicesProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ services, mainServiceName }) => (
        <PageWrapper>
          <InstanceProvider
            label={words("inventory.instanceComposer.title.view")}
            services={services}
            mainServiceName={mainServiceName}
            instanceId={instance}
            editable={false}
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

/**
 * PageWrapper component.
 * Wraps the content of the Page component with a PageContainer.
 */
const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer
    {...props}
    title={words("inventory.instanceComposer.title.view")}
  >
    {children}
  </PageContainer>
);
