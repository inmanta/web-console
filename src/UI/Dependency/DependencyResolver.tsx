import React, { useContext } from "react";
import { DependencyContext } from "./Dependency";

interface Props {
  environment: string;
}

export const DependencyResolver: React.FC<Props> = ({ environment }) => {
  const { fileFetcher, environmentModifier } = useContext(DependencyContext);

  fileFetcher.setEnvironment(environment);
  environmentModifier.setEnvironment(environment);

  return null;
};
