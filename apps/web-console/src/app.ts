import { environmentFeature } from "@inmanta/web-console-feature-environment";
import { graphiqlFeature } from "@inmanta/web-console-feature-graphiql";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import { resourceManagerFeature } from "@inmanta/web-console-feature-resource-manager";
import { userManagementFeature } from "@inmanta/web-console-feature-user-management";
import { createApp } from "@inmanta/web-console-shell";

/**
 * The web console: the shell with every feature, and the shell's default options. The composer
 * is loaded at runtime from its separate build, so a deployment can leave it out or install it
 * later.
 */
export const app = createApp({
  features: [
    environmentFeature,
    graphiqlFeature,
    userManagementFeature,
    lsmFeature,
    resourceManagerFeature,
    orchestrationEngineFeature,
  ],
  runtimeFeatures: [
    {
      id: "composer",
      isEnabled: (orchestratorProvider) => orchestratorProvider.isComposerEnabled(),
      // The composer's separate build, see vite.config.ts.
      load: () => import("composer/feature"),
    },
  ],
});
