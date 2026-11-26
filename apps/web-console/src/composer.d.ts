/**
 * The entry of the composer's separate build. The dev server and the tests resolve it to the
 * composer's source; a build loads that build through its manifest instead (see app.ts).
 */
declare module "composer/feature" {
  import { RuntimeFeatureEntry } from "@inmanta/web-console-core";

  export const feature: RuntimeFeatureEntry["feature"];
  export const singletons: RuntimeFeatureEntry["singletons"];
}

/**
 * The name of the manifest the composer's separate build writes (`composerManifestFile` in its
 * vite.js), defined in vite.config.ts.
 */
declare const COMPOSER_MANIFEST_FILE: string;
