import React, { useContext } from "react";
import { ComposerCreatorProvider } from "@/UI/Components/Composer/Providers";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";

/**
 * Renders the Page component for the Instance Composer Creator Page.
 * If the composer feature is enabled, it renders the Canvas.
 * If the composer feature is disabled, it renders an EmptyView component with a message indicating that the composer is disabled.
 *
 * @returns {React.FC} The Page component.
 */
export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();
  const { orchestratorProvider } = useContext(DependencyContext);

  if (!orchestratorProvider.isComposerEnabled()) {
    return (
      <EmptyView
        message={words("instanceComposer.disabled")}
        aria-label="ComposerCreateView-Empty"
      />
    );
  }

  return <ComposerCreatorProvider serviceName={serviceName} />;
};
