import { FeatureModule } from "./FeatureModule";

/**
 * What the entry module of a runtime plugin exports: a feature that ships separately from the app
 * and is loaded while the app starts, like the composer.
 */
export interface PluginModule {
  /**
   * The feature the plugin adds. The app registers it like a feature it ships, once its version
   * matches the app's.
   */
  feature: FeatureModule;

  /**
   * The shared instances the plugin was built with: `getSharedInstances()` from
   * `@inmanta/web-console-core/Dependency`, called in the plugin. In development the app checks
   * they are its own, so a plugin with its own copy of React or of the web-console core layer
   * fails at startup instead of reading other contexts than the app.
   */
  sharedInstances: SharedInstances;
}

/**
 * Objects that the app and its plugins must share, by name.
 */
export type SharedInstances = Record<string, unknown>;
