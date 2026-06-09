import React, { useContext } from "react";
import { Navigate } from "react-router";
import { DependencyContext } from "@/UI/Dependency";

/**
 * DefaultRoute handles the "/" redirect logic:
 * - If an environment is already selected → go to Dashboard (keeps the ?env= param)
 * - If environments exist but none is selected → auto-select the first one and go to Dashboard
 * - If no environments exist at all → go to Create Environment
 *
 * This component is rendered inside RouteOutlet which wraps the Initializer, so
 * environmentHandler.useAll() is guaranteed to be populated before this renders.
 */
export const DefaultRoute: React.FC = () => {
  const { environmentHandler, routeManager } = useContext(DependencyContext);

  const allEnvironments = environmentHandler.useAll();
  const selected = environmentHandler.useSelected();

  const dashboardUrl = routeManager.getUrl("Dashboard", undefined);
  const createEnvUrl = routeManager.getUrl("CreateEnvironment", undefined);

  if (selected) {
    return <Navigate to={`${dashboardUrl}?env=${selected.id}`} replace />;
  }

  if (allEnvironments.length === 0) {
    return <Navigate to={createEnvUrl} replace />;
  }

  const lastEnvId = localStorage.getItem("lastSelectedEnvironment");
  const lastEnv = lastEnvId ? allEnvironments.find((e) => e.id === lastEnvId) : undefined;
  const fallbackEnv = lastEnv ?? allEnvironments[0];

  return <Navigate to={`${dashboardUrl}?env=${fallbackEnv.id}`} replace />;
};
