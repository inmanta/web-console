import { useContext, useEffect } from "react";
import { registerMessages, words } from "@inmanta/web-console-core";
import { DependencyContext, getSingletons } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { useAppFeatures } from "./AppFeatures";
import { loadRuntimeFeatures } from "./loadRuntimeFeatures";

/**
 * How long a feature may take to load before the app starts without it, in ms.
 */
const LOAD_TIMEOUT = 15000;

/**
 * Loads the app's runtime features once the server status is known, which decides which ones
 * are enabled. Registers the messages of the features that load, and shows a notice for each
 * feature left out because its version doesn't match the app's.
 *
 * @param isServerStatusKnown - whether the orchestrator provider has the server status
 * @returns whether the runtime features are loaded, so the pages can be shown
 */
export const useLoadRuntimeFeatures = (isServerStatusKnown: boolean): boolean => {
  const { runtimeFeatures, status, startLoading } = useAppFeatures();
  const { orchestratorProvider } = useContext(DependencyContext);
  const { notify } = useAppAlert();

  useEffect(() => {
    if (!isServerStatusKnown) {
      return;
    }

    startLoading(async () => {
      const { features, versionMismatches } = await loadRuntimeFeatures(
        runtimeFeatures,
        orchestratorProvider,
        {
          version: APP_VERSION,
          singletons: getSingletons(),
          // In development a misconfigured build stops the app, so it can't go unnoticed.
          onSingletonMismatch: import.meta.env.DEV ? "throw" : "leaveOut",
          timeout: LOAD_TIMEOUT,
        }
      );

      versionMismatches.forEach(({ id, version }) =>
        notify({
          variant: "warning",
          title: words("runtimeFeatures.versionMismatch.title")(id),
          message: words("runtimeFeatures.versionMismatch.message")(id, version, APP_VERSION),
          testId: `version-mismatch-${id}`,
        })
      );
      features.forEach(({ messages }) => messages && registerMessages(messages));

      return features;
    });
  }, [isServerStatusKnown, runtimeFeatures, orchestratorProvider, notify, startLoading]);

  return status === "done";
};
