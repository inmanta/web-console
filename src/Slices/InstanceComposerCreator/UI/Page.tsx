import React, { useContext } from "react";
import { DependencyContext, words } from "@/UI";
import { EmptyView } from "@/UI/Components";
import { ComposerCreatorProvider } from "@/UI/Components/Diagram/Context/ComposerCreatorProvider";
import { useRouteParams } from "@/UI/Routing";

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

  return <ComposerCreatorProvider serviceName={serviceName} />;
};
