/**
 * The entry of the composer's separate build, which the app loads at runtime (see vite.config.ts).
 */
declare module "composer/feature" {
  import { RuntimeFeatureEntry } from "@inmanta/web-console-core";

  export const feature: RuntimeFeatureEntry["feature"];
  export const singletons: RuntimeFeatureEntry["singletons"];
}
