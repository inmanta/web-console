import { RuntimeFeatureEntry } from "@inmanta/web-console-core";
import { getSingletons } from "@inmanta/web-console-core/Dependency";
import { composerFeature } from ".";

/**
 * The entry of the composer's separate build (vite.config.ts), which the ISO app loads at runtime
 * as `composer/feature`.
 */
export const { feature, singletons }: RuntimeFeatureEntry = {
  feature: composerFeature,
  singletons: getSingletons(),
};
