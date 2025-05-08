import React, { useContext, useEffect } from "react";
import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "./Dependency";

interface Props {
  environment: FlatEnvironment;
}

export const DependencyResolver: React.FC<Props> = ({ environment }) => {
  const { fileFetcher, environmentModifier } = useContext(DependencyContext);

  useEffect(() => {
    fileFetcher.setEnvironment(environment.id);
    environmentModifier.setEnvironment(environment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  return null;
};
