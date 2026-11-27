import React from "react";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import { ComposerPage } from "@inmanta/web-console-feature-composer/Components/Composer/ComposerPage";

/**
 * The Instance Composer page that creates an instance of the route's service.
 */
export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();

  return <ComposerPage serviceName={serviceName} editable />;
};
