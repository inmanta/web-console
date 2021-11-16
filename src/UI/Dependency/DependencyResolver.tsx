import React, { useContext } from "react";
import { DependencyContext } from "./Dependency";

interface Props {
  environment: string;
}

export const DependencyResolver: React.FC<Props> = ({ environment }) => {
  const {
    queryResolver,
    commandResolver,
    urlManager,
    fileFetcher,
    environmentModifier,
  } = useContext(DependencyContext);
  queryResolver.getManagerResolver().resolve(environment);
  commandResolver.getManagerResolver().resolve(environment);
  urlManager.setEnvironment(environment);
  fileFetcher.setEnvironment(environment);
  environmentModifier.setEnvironment(environment);
  return null;
};
