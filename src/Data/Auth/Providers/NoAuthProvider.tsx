import React from "react";
import { GetAuthContext, defaultAuthContext } from "../AuthContext";

export const NoAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <GetAuthContext.Provider value={defaultAuthContext}>
      {children}
    </GetAuthContext.Provider>
  );
};
