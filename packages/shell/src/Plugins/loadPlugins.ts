import { FeatureModule, OrchestratorProvider, SharedInstances } from "@inmanta/web-console-core";
import { AppPlugin } from "./AppPlugin";

/**
 * What loading the plugins of an app gave.
 */
export interface LoadedPlugins {
  /**
   * The features of the plugins that loaded and match the app's version, in the order of the
   * plugins.
   */
  features: FeatureModule[];

  /**
   * The plugins that loaded but were built for another version, so they are left out.
   */
  mismatches: { id: string; version: string }[];
}

interface Options {
  /**
   * The version of the app. A plugin's feature must have exactly this version.
   */
  version: string;

  /**
   * The app's shared instances. When given, a plugin with other instances throws, so a
   * misconfigured shared module fails at startup. Only checked in development.
   */
  sharedInstances?: SharedInstances;
}

/**
 * Loads the enabled plugins of an app, in parallel. A plugin that fails to load, e.g. because it
 * isn't installed, is left out with a warning in the console, so the app starts without it.
 *
 * @param plugins - the plugins of the app
 * @param orchestratorProvider - the server status, to decide which plugins are enabled
 * @param options - the version of the app and, in development, its shared instances
 * @returns the features of the loaded plugins and the plugins left out for their version
 * @throws when a plugin uses other shared instances than the app
 */
export const loadPlugins = async (
  plugins: AppPlugin[],
  orchestratorProvider: OrchestratorProvider,
  { version, sharedInstances }: Options
): Promise<LoadedPlugins> => {
  const enabled = plugins.filter(({ isEnabled }) => !isEnabled || isEnabled(orchestratorProvider));
  const modules = await Promise.all(
    enabled.map(({ id, load }) =>
      load().catch((error: unknown) => {
        console.warn(`The ${id} plugin could not be loaded, the app starts without it.`, error);

        return undefined;
      })
    )
  );
  const result: LoadedPlugins = { features: [], mismatches: [] };

  enabled.forEach(({ id }, index) => {
    const module = modules[index];

    if (module === undefined) {
      return;
    }

    if (module.feature.version !== version) {
      result.mismatches.push({ id, version: module.feature.version });

      return;
    }

    if (sharedInstances) {
      const different = Object.keys(sharedInstances).filter(
        (key) => module.sharedInstances[key] !== sharedInstances[key]
      );

      if (different.length > 0) {
        throw new Error(
          `The ${id} plugin has its own copy of ${different.join(", ")} instead of the app's. Share these modules with the plugin.`
        );
      }
    }

    result.features.push(module.feature);
  });

  return result;
};
