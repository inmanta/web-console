import React from "react";
import { AuthContext, defaultAuthContext } from "../AuthContext";
/**
 * Component that implements a null authentication provider when no authentication is enabled.
 */
export const NoAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <AuthContext.Provider value={defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};
