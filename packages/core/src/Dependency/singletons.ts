import React from "react";
import { UNSAFE_NavigationContext } from "react-router";
import { QueryClientContext } from "@tanstack/react-query";
import { Singletons } from "@inmanta/web-console-core";
import { DependencyContext } from "./Dependency";

/**
 * The objects the app and the features it loads at runtime must share, one of each: React, React
 * Router's navigation context, and the contexts that carry the app's dependencies and query
 * client. A separate build that resolves its own copy of these modules gets other objects, see
 * `RuntimeFeatureEntry.singletons`.
 *
 * These are the ones whose copy breaks a page without an error. Other shared packages
 * (PatternFly, styled-components, the shared components) aren't listed: the composer's build
 * fails when it bundles a copy of any package the app provides (its vite.config.ts).
 *
 * @returns the singletons as this copy of the web-console core layer sees them
 */
export const getSingletons = (): Singletons => ({
  react: React,
  reactRouter: UNSAFE_NavigationContext,
  queryClientContext: QueryClientContext,
  dependencyContext: DependencyContext,
});
