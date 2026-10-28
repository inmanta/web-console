import { environmentFeature } from "@/Features/Environment";
import { graphiqlFeature } from "@/Features/GraphiQL";
import { lsmFeature } from "@/Features/Lsm";
import { resourceManagerFeature } from "@/Features/ResourceManager";
import { userManagementFeature } from "@/Features/UserManagement";
import { composerFeature } from "@inmanta/web-console-feature-composer";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
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
