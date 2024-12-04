import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView } from "@/UI/Components";
import { ComposerEditorProvider } from "@/UI/Components/Diagram/Context/ComposerEditorProvider";

/**
 * Renders the Page component for the Instance Composer Editor Page.
 * If the composer feature is enabled, it renders the Canvas component wrapped in a ServicesProvider.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 *
 * @returns {React.FC} The Page component.
 */
export const Page: React.FC = () => {
  const { service: serviceName, instance } =
    useRouteParams<"InstanceComposerEditor">();
  const { featureManager } = useContext(DependencyContext);

  if (!featureManager.isComposerEnabled()) {
    return (
      <EmptyView
        message={words("instanceComposer.disabled")}
        aria-label="InstaceComposerEditor-Disabled"
      />
    );
  }

  return (
    <ComposerEditorProvider
      serviceName={serviceName}
      instance={instance}
      editable
    />
  );
};
