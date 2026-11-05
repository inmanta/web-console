import {
  FeatureModule,
  OrchestratorProvider,
  RuntimeFeatureEntry,
  Singletons,
} from "@inmanta/web-console-core";
import { RuntimeFeature } from "./RuntimeFeature";

/**
 * What loading the runtime features of an app gave.
 */
export interface LoadedRuntimeFeatures {
  /**
   * The features that loaded and match the app's version, in the order they are listed.
   */
  features: FeatureModule[];

  /**
   * The features that loaded but were built for another version, so they are left out.
   */
  mismatches: { id: string; version: string }[];
}

interface Options {
  /**
   * The version of the app. A feature must have exactly this version.
   */
  version: string;

  /**
   * The app's singletons. A feature built with other ones would read other contexts than the
   * app, see `RuntimeFeatureEntry.singletons`.
   */
  singletons: Singletons;

  /**
   * What happens to a feature built with other singletons: "throw" fails the loading, so a
   * misconfigured build stops the app; "leaveOut" leaves the feature out with an error in the
   * console.
   */
  onSingletonMismatch: "throw" | "leaveOut";
}

/**
 * Whether a loaded module has the shape of an entry: a feature with a version, and singletons.
 */
const isEntry = (module: unknown): module is RuntimeFeatureEntry => {
  const { feature, singletons } = (module ?? {}) as Partial<RuntimeFeatureEntry>;

  return (
    typeof feature?.version === "string" && typeof singletons === "object" && singletons !== null
  );
};

/**
 * Loads the enabled runtime features of an app, in parallel. A feature that fails to load, e.g.
 * because it isn't installed, or whose module isn't an entry (`RuntimeFeatureEntry`), is left out
 * with a warning in the console, so the app starts without it.
 *
 * @param runtimeFeatures - the runtime features of the app
 * @param orchestratorProvider - the server status, to decide which features are enabled
 * @param options - the version and singletons of the app, and what to do with other singletons
 * @returns the loaded features and the ones left out for their version
 * @throws when a feature was built with other singletons and `onSingletonMismatch` is "throw"
 */
export const loadRuntimeFeatures = async (
  runtimeFeatures: RuntimeFeature[],
  orchestratorProvider: OrchestratorProvider,
  { version, singletons, onSingletonMismatch }: Options
): Promise<LoadedRuntimeFeatures> => {
  const enabled = runtimeFeatures.filter(
    ({ isEnabled }) => !isEnabled || isEnabled(orchestratorProvider)
  );
  const entries = await Promise.all(
    enabled.map(({ id, load }) =>
      load().then(
        (entry: unknown) => {
          if (isEntry(entry)) {
            return entry;
          }
          console.warn(
            `The ${id} feature isn't a runtime feature entry, the app starts without it.`
          );

          return undefined;
        },
        (error: unknown) => {
          console.warn(`The ${id} feature could not be loaded, the app starts without it.`, error);

          return undefined;
        }
      )
    )
  );
  const result: LoadedRuntimeFeatures = { features: [], mismatches: [] };

  enabled.forEach(({ id }, index) => {
    const entry = entries[index];

    if (entry === undefined) {
      return;
    }

    if (entry.feature.version !== version) {
      result.mismatches.push({ id, version: entry.feature.version });

      return;
    }

    const different = Object.keys(singletons).filter(
      (key) => entry.singletons[key] !== singletons[key]
    );

    if (different.length > 0) {
      const message = `The ${id} feature has its own copy of ${different.join(", ")} instead of the app's. Share these modules with its build.`;

      if (onSingletonMismatch === "throw") {
        throw new Error(message);
      }
      console.error(`${message} The app starts without it.`);

      return;
    }

    result.features.push(entry.feature);
  });

  return result;
};
