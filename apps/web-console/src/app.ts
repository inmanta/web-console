import { environmentFeature } from "@inmanta/web-console-feature-environment";
import { graphiqlFeature } from "@inmanta/web-console-feature-graphiql";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import { resourceManagerFeature } from "@inmanta/web-console-feature-resource-manager";
import { userManagementFeature } from "@inmanta/web-console-feature-user-management";
import { createApp, loadManifestEntry } from "@inmanta/web-console-shell";

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
      // Loaded whenever it is installed, also without the licence: its pages then say that it
      // isn't licensed, and it adds the read-only "Show in Composer" action.
      // A build loads the composer's separate build through the manifest it writes
      // (`composerManifestFile` in its vite.js); the dev server serves its source as
      // `composer/feature`, see vite.config.ts.
      load: () =>
        import.meta.env.DEV
          ? import("composer/feature")
          : loadManifestEntry("./composer-manifest.json"),
    },
  ],
});
