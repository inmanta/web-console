import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { FeatureModule } from "@inmanta/web-console-core";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { RuntimeFeature } from "./RuntimeFeature";

type LoadStatus = "idle" | "loading" | "done";

interface AppFeatures {
  /**
   * Every feature of the running app: the bundled ones, then the ones loaded at runtime.
   */
  features: FeatureModule[];

  /**
   * The features loaded at runtime. Their pages aren't in the route table the app started with,
   * see `RuntimeFeatureRoutes`.
   */
  loadedRuntimeFeatures: FeatureModule[];

  /**
   * The features the app loads at runtime, as listed in `createApp`.
   */
  runtimeFeatures: RuntimeFeature[];

  /**
   * Whether the runtime features are loaded: "idle" until `startLoading`, "done" once they are
   * (or right away when the app has none).
   */
  status: LoadStatus;

  /**
   * Loads the runtime features once: runs `load` and adds the features it returns. Later calls
   * do nothing. When `load` fails, the app shows the error instead of its pages.
   */
  startLoading: (load: () => Promise<FeatureModule[]>) => void;
}

const AppFeaturesContext = createContext<AppFeatures>({
  features: [],
  loadedRuntimeFeatures: [],
  runtimeFeatures: [],
  status: "done",
  startLoading: () => {},
});

interface Props {
  features: FeatureModule[];
  runtimeFeatures: RuntimeFeature[];
}

/**
 * Holds the features of the running app, which grow once its runtime features are loaded.
 */
export const AppFeaturesProvider: React.FC<React.PropsWithChildren<Props>> = ({
  features,
  runtimeFeatures,
  children,
}) => {
  const [status, setStatus] = useState<LoadStatus>(runtimeFeatures.length > 0 ? "idle" : "done");
  const [loadedRuntimeFeatures, setLoadedRuntimeFeatures] = useState<FeatureModule[]>([]);
  const [error, setError] = useState<Error>();

  const startLoading = useCallback(
    (load: () => Promise<FeatureModule[]>) => {
      if (status !== "idle") {
        return;
      }

      setStatus("loading");
      load().then(
        (loaded) => {
          setLoadedRuntimeFeatures(loaded);
          setStatus("done");
        },
        (loadError: unknown) =>
          setError(loadError instanceof Error ? loadError : new Error(String(loadError)))
      );
    },
    [status]
  );

  const value = useMemo(
    () => ({
      features: [...features, ...loadedRuntimeFeatures],
      loadedRuntimeFeatures,
      runtimeFeatures,
      status,
      startLoading,
    }),
    [features, loadedRuntimeFeatures, runtimeFeatures, status, startLoading]
  );

  if (error !== undefined) {
    return <ErrorView ariaLabel="RuntimeFeatures-Error" message={error.message} />;
  }

  return <AppFeaturesContext.Provider value={value}>{children}</AppFeaturesContext.Provider>;
};

/**
 * The features of the running app and the state of its runtime features.
 *
 * @returns the app's features, see `AppFeaturesProvider`
 */
export const useAppFeatures = (): AppFeatures => useContext(AppFeaturesContext);
