import React from "react";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { ComposerPage } from "@inmanta/web-console-feature-composer/Components/Composer/ComposerPage";

/**
 * The Instance Composer page that shows the route's instance, read-only.
 */
export const Page: React.FC = () => {
  const { service: serviceName, instance } = useRouteParams<"InstanceComposerViewer">();

  return <ComposerPage serviceName={serviceName} instanceId={instance} editable={false} />;
};
