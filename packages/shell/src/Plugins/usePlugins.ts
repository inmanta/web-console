import { useContext, useEffect } from "react";
import { registerMessages, words } from "@inmanta/web-console-core";
import { DependencyContext, getSharedInstances } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { useAppFeatures } from "./AppFeatures";
import { loadPlugins } from "./loadPlugins";

/**
 * Loads the app's plugins once the server status is known, which decides which ones are enabled.
 * Registers the messages of the plugins that load, and shows a notice for each plugin left out
 * because its version doesn't match the app's.
 *
 * @param isServerStatusKnown - whether the orchestrator provider has the server status
 * @returns whether the plugins are loaded, so the pages can be shown
 */
export const usePlugins = (isServerStatusKnown: boolean): boolean => {
  const { plugins, status, startLoading } = useAppFeatures();
  const { orchestratorProvider } = useContext(DependencyContext);
  const { notify } = useAppAlert();

  useEffect(() => {
    if (!isServerStatusKnown) {
      return;
    }

    startLoading(async () => {
      const { features, mismatches } = await loadPlugins(plugins, orchestratorProvider, {
        version: APP_VERSION,
        sharedInstances: import.meta.env.DEV ? getSharedInstances() : undefined,
      });

      mismatches.forEach(({ id, version }) =>
        notify({
          variant: "warning",
          title: words("plugins.versionMismatch.title")(id),
          message: words("plugins.versionMismatch.message")(id, version, APP_VERSION),
          testId: `plugin-version-mismatch-${id}`,
        })
      );
      features.forEach(({ messages }) => messages && registerMessages(messages));

      return features;
    });
  }, [isServerStatusKnown, plugins, orchestratorProvider, notify, startLoading]);

  return status === "done";
};
