import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, PageContainer } from "@/UI/Components";
import { ComposerCreatorProvider } from "@/UI/Components/Diagram/Context/ComposerCreatorProvider";

/**
 * Renders the Page component for the Instance Composer Creator Page.
 * If the composer feature is enabled, it renders the Canvas.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 *
 * @returns {React.FC} The Page component.
 */
export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();
  const { featureManager } = useContext(DependencyContext);

  if (!featureManager.isComposerEnabled()) {
    <EmptyView
      message={words("instanceComposer.disabled")}
      aria-label="ComposerCreateView-Empty"
    />;
  }

  return (
    <PageWrapper>
      <ComposerCreatorProvider serviceName={serviceName} />
    </PageWrapper>
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
    aria-label="ComposerCreateView"
    {...props}
    pageTitle={words("instanceComposer.title")}
  >
    {children}
  </PageContainer>
);