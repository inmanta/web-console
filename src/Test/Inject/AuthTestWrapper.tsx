import React, { useContext } from "react";
import { AuthContext } from "@/Data/Auth/AuthContext";
import { MockedDependencyProvider } from "./dependencies";

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
export const AuthTestWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const authHelper = useContext(AuthContext);

  return <MockedDependencyProvider authHelper={authHelper}>{children}</MockedDependencyProvider>;
};
