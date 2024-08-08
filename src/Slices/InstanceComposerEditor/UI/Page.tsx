import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer } from "@/UI/Components";
import { ComposerEditorProvider } from "@/UI/Components/Diagram/Context/ComposerEditorProvider";

/**
 * Renders the Page component for the Instance Composer Editor Page.
 * If the composer feature is enabled, it renders the Canvas component wrapped in a ServicesProvider.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 */
export const Page = () => {
  const { service: serviceName, instance } =
    useRouteParams<"InstanceComposerEditor">();
  const { featureManager } = useContext(DependencyContext);

  if (!featureManager.isComposerEnabled()) {
    return (
      <EmptyView
        message={words("inventory.instanceComposer.disabled")}
        aria-label="OrdersView-Empty"
      />
    );
  }

  return (
    <PageWrapper>
      <ComposerEditorProvider
        serviceName={serviceName}
        instance={instance}
        editable
      />
    </PageWrapper>
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
    pageTitle={words("inventory.instanceComposer.title.edit")}
  >
    {children}
  </PageContainer>
);
