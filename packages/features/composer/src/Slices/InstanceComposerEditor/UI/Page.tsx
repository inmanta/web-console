import React from "react";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { ComposerPage } from "@inmanta/web-console-feature-composer/Components/Composer/ComposerPage";

/**
 * The Instance Composer page that edits the route's instance.
 */
export const Page: React.FC = () => {
  const { service: serviceName, instance } = useRouteParams<"InstanceComposerEditor">();

  return <ComposerPage serviceName={serviceName} instanceId={instance} editable />;
};
