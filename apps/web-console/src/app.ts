import { graphiqlFeature } from "@/Features/GraphiQL";
import { userManagementFeature } from "@/Features/UserManagement";
import { composerFeature } from "@inmanta/web-console-feature-composer";
import { environmentFeature } from "@inmanta/web-console-feature-environment";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import { resourceManagerFeature } from "@inmanta/web-console-feature-resource-manager";
import { createApp } from "@inmanta/web-console-shell";

/**
 * The web console: the shell with every feature, and the shell's default options.
 */
export const app = createApp({
  features: [
    environmentFeature,
    graphiqlFeature,
    userManagementFeature,
    lsmFeature,
    composerFeature,
    resourceManagerFeature,
    orchestrationEngineFeature,
  ],
});
