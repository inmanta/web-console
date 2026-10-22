import { useContext } from "react";
import { ExtensionPointRegistry } from "@/Core";
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
