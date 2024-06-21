import React, { useContext } from "react";
import { AuthContext } from "@/Data/Auth/AuthContext";
import { Dependencies, DependencyProvider } from "@/UI";

type Props = {
  dependencies: Partial<Dependencies>;
};

/**
 * A component that injects dependencies into its children components.
 * The purpose of this file is to provide authContext in the correct manner to the test scenarios where authentication is being used.
 *
 * @component
 * @example
 * ```tsx
 * import React from "react";
 * import { TestInjector } from "@/Test/Inject/TestInjector";
 *
 * const MyComponent: React.FC = (config: KeycloakAuthConfig | LocalConfig | undefined) => {
 *   return (
 *     <AuthProvider config={config}>
 *      <TestInjector dependencies={dependencies}>
 *       <Login />
 *     </TestInjector>
 *    </AuthProvider>
 *   );
 * };
 * ```
 */
export const TestInjector: React.FC<React.PropsWithChildren<Props>> = ({
  dependencies,
  children,
}) => {
  const authHelper = useContext(AuthContext);

  return (
    <DependencyProvider dependencies={{ ...dependencies, authHelper }}>
      {children}
    </DependencyProvider>
  );
};
