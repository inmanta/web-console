import React, { useContext } from "react";
import { DependencyContext } from "./Dependency";

export const DependencyResolver: React.FC<{ environment: string }> = ({
  environment,
}) => {
  const { queryResolver, commandResolver, urlManager, fileFetcher } =
    useContext(DependencyContext);
  queryResolver.getManagerResolver().resolve(environment);
  commandResolver.getManagerResolver().resolve(environment);
  urlManager.setEnvironment(environment);
  fileFetcher.setEnvironment(environment);
  return null;
};
