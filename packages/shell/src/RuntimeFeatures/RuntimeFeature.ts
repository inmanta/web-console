import { OrchestratorProvider } from "@inmanta/web-console-core";

/**
 * A feature the app loads at runtime from a separate build, instead of bundling it, e.g. the
 * composer: it can then be left out of a deployment, or installed later. The shell loads it while
 * the app starts, once the server status is known.
 */
export interface RuntimeFeature {
  /**
   * The id of the feature: the entry must contain the feature with this id. Users also see it in
   * the notice when the feature's version doesn't match the app's.
   */
  id: string;

  /**
   * Whether this orchestrator uses the feature, from the server status (e.g. a licensed feature).
   * Defaults to always. A feature that isn't enabled is never fetched.
   */
  isEnabled?: (orchestratorProvider: OrchestratorProvider) => boolean;

  /**
   * Fetches the entry module of the feature's build (a `RuntimeFeatureEntry`). A separate build
   * can return anything, so the shell checks what it gets. When it fails, e.g. because the feature
   * isn't installed, the app starts without it.
   */
  load: () => Promise<unknown>;
}
