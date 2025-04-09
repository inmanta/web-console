import React, { useContext } from "react";
import { AuthContext } from "../AuthContext";

/**
 * Component that implements a null authentication provider when no authentication is enabled.
 */
export const NoAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const authContext = useContext(AuthContext);

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};
