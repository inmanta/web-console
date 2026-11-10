import { environmentFeature } from "@inmanta/web-console-feature-environment";
import { graphiqlFeature } from "@inmanta/web-console-feature-graphiql";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import { resourceManagerFeature } from "@inmanta/web-console-feature-resource-manager";
import { userManagementFeature } from "@inmanta/web-console-feature-user-management";
import { createApp } from "@inmanta/web-console-shell";

/**
 * The open-source web console: the shell with the OSS features only. The ISO features (lsm and
 * the composer) are not in its dependencies, so they are neither installed nor bundled.
 */
export const app = createApp({
  features: [
    environmentFeature,
    graphiqlFeature,
    userManagementFeature,
    resourceManagerFeature,
    orchestrationEngineFeature,
  ],
});
