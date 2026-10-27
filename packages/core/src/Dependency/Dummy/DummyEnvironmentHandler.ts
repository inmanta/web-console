import { EnvironmentHandler } from "@inmanta/web-console-core";
import type { EnvironmentPreview } from "@inmanta/web-console-core/Queries/Slices/Environment";

export function DummyEnvironmentHandler(): EnvironmentHandler {
  function useId(): string {
    throw new Error("Method not implemented.");
  }

  function set(): void {
    throw new Error("Method not implemented.");
  }

  function useName(): string {
    throw new Error("Method not implemented.");
  }

  function useSelected(): EnvironmentPreview {
    throw new Error("Method not implemented.");
  }

  function determineSelected(): EnvironmentPreview | undefined {
    throw new Error("Method not implemented.");
  }

  function useIsCompiling(): boolean {
    throw new Error("Method not implemented.");
  }

  function useIsHalted(): boolean {
    throw new Error("Method not implemented.");
  }

  function useIsServerCompileEnabled(): boolean {
    throw new Error("Method not implemented.");
  }

  function useIsProtectedEnvironment(): boolean {
    throw new Error("Method not implemented.");
  }

  function useIsExpertModeEnabled(): boolean {
    throw new Error("Method not implemented.");
  }

  function setAllEnvironments(): void {
    throw new Error("Method not implemented.");
  }

  function useAll(): EnvironmentPreview[] {
    return [];
  }

  return {
    useName,
    useId,
    set,
    useSelected,
    useAll,
    determineSelected,
    useIsHalted,
    useIsCompiling,
    useIsServerCompileEnabled,
    useIsProtectedEnvironment,
    useIsExpertModeEnabled,
    setAllEnvironments,
  };
}
