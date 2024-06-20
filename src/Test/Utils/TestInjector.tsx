import React, { useContext } from "react";
import { AuthContext } from "@/Data/Auth/AuthContext";
import { Dependencies, DependencyProvider } from "@/UI";

type Props = {
  // Define your component props here
  dependencies: Partial<Dependencies>;
};

const TestInjector: React.FC<React.PropsWithChildren<Props>> = ({
  dependencies,
  children,
}) => {
  // Your component logic goes here
  const useAuth = useContext(AuthContext);

  return (
    <DependencyProvider dependencies={{ ...dependencies, useAuth }}>
      {children}
    </DependencyProvider>
  );
};

export default TestInjector;
