import React from "react";
import { GetAuthContext, defaultAuthContext } from "../AuthContext";
/**
 * Component that implements a null authentication provider when no authentication is enabled.
 */
export const NoAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <GetAuthContext.Provider value={defaultAuthContext}>
      {children}
    </GetAuthContext.Provider>
  );
};
