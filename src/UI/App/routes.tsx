import React, { useContext } from "react";
import { DependencyManagerContext, DependencyProvider } from "@/UI/Dependency";
import { PageRouter } from "../Routing";

const AppRoutes: React.FC<{ environment: string }> = ({ environment }) => {
  const dependencyManager = useContext(DependencyManagerContext);
  const dependencies = dependencyManager.getDependencies(environment);

  return (
    <DependencyProvider dependencies={dependencies}>
      <PageRouter />
    </DependencyProvider>
  );
};

export { AppRoutes };
