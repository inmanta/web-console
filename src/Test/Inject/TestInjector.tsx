import React, { useContext } from "react";
import { AuthContext } from "@/Data/Auth/AuthContext";
import { Dependencies, DependencyProvider } from "@/UI";

type Props = {
  // Define your component props here
  dependencies: Partial<Dependencies>;
};

export const TestInjector: React.FC<React.PropsWithChildren<Props>> = ({
  dependencies,
  children,
}) => {
  // Your component logic goes here
  const authHelper = useContext(AuthContext);

  return (
    <DependencyProvider dependencies={{ ...dependencies, authHelper }}>
      {children}
    </DependencyProvider>
  );
};
