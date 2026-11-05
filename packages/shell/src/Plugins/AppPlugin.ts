import { OrchestratorProvider, PluginModule } from "@inmanta/web-console-core";

/**
 * A feature the app loads at runtime instead of shipping it in its bundle, e.g. the composer.
 * The shell loads it while the app starts, once the server status is known.
 */
export interface AppPlugin {
  /**
   * The name of the plugin, as users see it in the notice when its version doesn't match.
   */
  id: string;

  /**
   * Whether this orchestrator uses the plugin, from the server status (e.g. a licensed feature).
   * Defaults to always. A plugin that isn't enabled is never fetched.
   */
  isEnabled?: (orchestratorProvider: OrchestratorProvider) => boolean;

  /**
   * Fetches the plugin's entry module. When it fails, e.g. because the plugin isn't installed,
   * the app starts without it.
   */
  load: () => Promise<PluginModule>;
}
