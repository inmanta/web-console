import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  environment: string;
}

export const PageInitializer: React.FC<Props> = ({ environment }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [] = queryResolver.useOneTime<"GetEnvironmentSettings">({
    kind: "GetEnvironmentSettings",
    environment: environment,
  });

  return <></>;
};
