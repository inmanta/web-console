import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { FeatureModule } from "@inmanta/web-console-core";
import { AppPlugin } from "./AppPlugin";

type PluginStatus = "idle" | "loading" | "done";

interface AppFeatures {
  /**
   * Every feature of the running app: the ones it ships, then the ones its plugins added.
   */
  features: FeatureModule[];

  /**
   * The features the plugins added. Their pages aren't in the route table the app started with,
   * see `PluginRoutes`.
   */
  pluginFeatures: FeatureModule[];

  /**
   * The plugins of the app.
   */
  plugins: AppPlugin[];

  /**
   * Whether the plugins are loaded: "idle" until `startLoading`, "done" once they are (or right
   * away when the app has none).
   */
  status: PluginStatus;

  /**
   * Loads the plugins once: runs `load` and adds the features it returns. Later calls do nothing.
   * An error of `load` is thrown while rendering, for the app's error boundary.
   */
  startLoading: (load: () => Promise<FeatureModule[]>) => void;
}

const AppFeaturesContext = createContext<AppFeatures>({
  features: [],
  pluginFeatures: [],
  plugins: [],
  status: "done",
  startLoading: () => {},
});

interface Props {
  features: FeatureModule[];
  plugins: AppPlugin[];
}

/**
 * Holds the features of the running app, which grow once its plugins are loaded.
 */
export const AppFeaturesProvider: React.FC<React.PropsWithChildren<Props>> = ({
  features,
  plugins,
  children,
}) => {
  const [status, setStatus] = useState<PluginStatus>(plugins.length > 0 ? "idle" : "done");
  const [pluginFeatures, setPluginFeatures] = useState<FeatureModule[]>([]);
  const [error, setError] = useState<unknown>();

  const startLoading = useCallback(
    (load: () => Promise<FeatureModule[]>) => {
      if (status !== "idle") {
        return;
      }

      setStatus("loading");
      load().then(
        (loaded) => {
          setPluginFeatures(loaded);
          setStatus("done");
        },
        (loadError: unknown) => setError(loadError)
      );
    },
    [status]
  );

  const value = useMemo(
    () => ({
      features: [...features, ...pluginFeatures],
      pluginFeatures,
      plugins,
      status,
      startLoading,
    }),
    [features, pluginFeatures, plugins, status, startLoading]
  );

  if (error !== undefined) {
    throw error;
  }

  return <AppFeaturesContext.Provider value={value}>{children}</AppFeaturesContext.Provider>;
};

/**
 * The features of the running app and the state of its plugins.
 *
 * @returns the app's features, see `AppFeaturesProvider`
 */
export const useAppFeatures = (): AppFeatures => useContext(AppFeaturesContext);
