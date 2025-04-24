import React, { useContext } from "react";
import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "./Dependency";

interface Props {
  environment: FlatEnvironment;
}

export const DependencyResolver: React.FC<Props> = ({ environment }) => {
  const { fileFetcher, environmentModifier } = useContext(DependencyContext);

  fileFetcher.setEnvironment(environment.id);
  environmentModifier.setEnvironment(environment);

  return null;
};
