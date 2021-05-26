import React, { useContext } from "react";
import { DependencyContext } from "./Dependency";

export const DependencyResolver: React.FC<{ environment: string }> = ({
  environment,
  children,
}) => {
  const { queryResolver, commandResolver, urlManager } =
    useContext(DependencyContext);
  queryResolver.getManagerResolver().resolve(environment);
  commandResolver.getManagerResolver().resolve(environment);
  urlManager.setEnvironment(environment);

  return <>{children}</>;
};
