import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";

export const DependencyResolver: React.FC<{ environment: string }> = ({
  environment,
  children,
}) => {
  const { queryResolver, commandResolver } = useContext(DependencyContext);
  queryResolver.getManagerResolver().resolve(environment);
  commandResolver.getManagerResolver().resolve(environment);

  return <>{children}</>;
};
