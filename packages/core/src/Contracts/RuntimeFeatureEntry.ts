import { FeatureModule } from "./FeatureModule";

/**
 * What a feature that the app loads at runtime exports from its separate build, e.g. the
 * composer. See `runtimeFeatures` in the shell's `createApp`.
 */
export interface RuntimeFeatureEntry {
  /**
   * The feature. The app registers it like the features it bundles, once its version matches
   * the app's.
   */
  feature: FeatureModule;

  /**
   * The singletons the separate build uses: `getSingletons()` from
   * `@inmanta/web-console-core/Dependency`, called in that build. The app checks they are its
   * own. A build with its own copy of React, React Router or the web-console core layer would
   * read other contexts than the app, so it stops the app in development and is left out in
   * production.
   */
  singletons: Singletons;
}

/**
 * Objects the app and the features it loads at runtime must share, one of each, by name.
 */
export type Singletons = Record<string, unknown>;
