import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";

export const DependencyResolver: React.FC<{ environment: string }> = ({
  environment,
  children,
}) => {
  const { dataProvider, commandProvider } = useContext(DependencyContext);
  dataProvider.getManagerResolver().resolve(environment);
  commandProvider.getManagerResolver().resolve(environment);

  return <>{children}</>;
};
