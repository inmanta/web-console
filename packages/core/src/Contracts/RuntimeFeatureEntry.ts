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
   * `@inmanta/web-console-core/Dependency`, called in that build. In development the app checks
   * they are its own, so a build with its own copy of React or of the web-console core layer
   * fails at startup instead of reading other contexts than the app.
   */
  singletons: Singletons;
}

/**
 * Objects the app and the features it loads at runtime must share, one of each, by name.
 */
export type Singletons = Record<string, unknown>;
