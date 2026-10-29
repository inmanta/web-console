import { environmentFeature } from "@/Features/Environment";
import { resourceManagerFeature } from "@/Features/ResourceManager";
import { composerFeature } from "@inmanta/web-console-feature-composer";
import { graphiqlFeature } from "@inmanta/web-console-feature-graphiql";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import { userManagementFeature } from "@inmanta/web-console-feature-user-management";
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
