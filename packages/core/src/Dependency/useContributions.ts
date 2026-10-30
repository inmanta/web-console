import { useContext } from "react";
import { ExtensionPointRegistry, isLinkActionVisible, LinkAction } from "@inmanta/web-console-core";
import { DependencyContext } from "./Dependency";

/**
 * Returns what the features of the app contribute to an extension point, in the order of the
 * features. Empty when no feature contributes to it.
 *
 * @param point - the extension point
 * @returns the contributions of every feature to the extension point
 */
export const useContributions = <K extends keyof ExtensionPointRegistry>(
  point: K
): ExtensionPointRegistry[K][] => {
  const { features } = useContext(DependencyContext);

  return features.flatMap((feature) => feature.contributions?.[point] ?? []);
};

/**
 * The extension points whose contributions are links.
 */
type LinkActionPoint = {
  [K in keyof ExtensionPointRegistry]: ExtensionPointRegistry[K] extends LinkAction<never>
    ? K
    : never;
}[keyof ExtensionPointRegistry];

/**
 * Returns the links the features of the app contribute to an extension point, without the ones
 * their `isVisible` hides for this orchestrator and this login.
 *
 * @param point - an extension point whose contributions are links
 * @returns the visible links, in the order of the features
 */
export const useVisibleLinkActions = <K extends LinkActionPoint>(
  point: K
): ExtensionPointRegistry[K][] => {
  const { orchestratorProvider, authHelper } = useContext(DependencyContext);

  return useContributions(point).filter((action) =>
    isLinkActionVisible(action, orchestratorProvider, authHelper)
  );
};
