import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";

export const DependencyResolver: React.FC<{ environment: string }> = ({
  environment,
  children,
}) => {
  const { queryResolver, commandProvider } = useContext(DependencyContext);
  queryResolver.getManagerResolver().resolve(environment);
  commandProvider.getManagerResolver().resolve(environment);

  return <>{children}</>;
};
