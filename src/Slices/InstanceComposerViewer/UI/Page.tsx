import React, { useContext } from "react";
import { DependencyContext, words } from "@/UI";
import { EmptyView } from "@/UI/Components";
import { ComposerEditorProvider } from "@/UI/Components/Diagram/Context/ComposerEditorProvider";
import { useRouteParams } from "@/UI/Routing";

/**
 * Renders the Page component for the Instance Composer Viewer Page.
 * If the composer feature is enabled, it renders the Canvas component wrapped in a ServicesProvider.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 *
 * @returns {React.FC} The Page component.
 */
export const Page: React.FC = () => {
  const { service: serviceName, instance } = useRouteParams<"InstanceComposerViewer">();
  const { orchestratorProvider } = useContext(DependencyContext);

  if (!orchestratorProvider.isComposerEnabled()) {
    return (
      <EmptyView message={words("instanceComposer.disabled")} aria-label="ComposerView-Disabled" />
    );
  }

  return <ComposerEditorProvider serviceName={serviceName} instance={instance} editable={false} />;
};
