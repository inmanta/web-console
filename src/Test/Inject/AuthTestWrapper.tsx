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
 * import { AuthTestWrapper } from "@/Test/Inject/AuthTestWrapper";
 *
 * const MyComponent: React.FC = (config: KeycloakAuthConfig | LocalConfig | undefined) => {
 *   return (
 *     <AuthProvider config={config}>
 *      <AuthTestWrapper dependencies={dependencies}>
 *       <Login />
 *     </AuthTestWrapper>
 *    </AuthProvider>
 *   );
 * };
 * ```
 */
export const AuthTestWrapper: React.FC<React.PropsWithChildren<Props>> = ({
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
