import React from "react";
import { QueryClientContext } from "@tanstack/react-query";
import { Singletons } from "@inmanta/web-console-core";
import { DependencyContext } from "./Dependency";

/**
 * The objects the app and the features it loads at runtime must share, one of each: React, and
 * the contexts that carry the app's dependencies and query client. A separate build that resolves
 * its own copy of these modules gets other objects, see `RuntimeFeatureEntry.singletons`.
 *
 * @returns the singletons as this copy of the web-console core layer sees them
 */
export const getSingletons = (): Singletons => ({
  react: React,
  queryClientContext: QueryClientContext,
  dependencyContext: DependencyContext,
});
