import React from "react";
import { QueryClientContext } from "@tanstack/react-query";
import { SharedInstances } from "@inmanta/web-console-core";
import { DependencyContext } from "./Dependency";

/**
 * The objects the app and its runtime plugins must share: React, and the contexts that carry the
 * app's dependencies and query client. A plugin that resolves its own copy of these modules gets
 * different objects, see `PluginModule.sharedInstances`.
 *
 * @returns the shared objects as this copy of the web-console core layer sees them
 */
export const getSharedInstances = (): SharedInstances => ({
  react: React,
  queryClientContext: QueryClientContext,
  dependencyContext: DependencyContext,
});
