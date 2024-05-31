import React from "react";
import { AuthContext, defaultAuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

const NoAuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <AuthContext.Provider
      value={{
        ...defaultAuthContext,
        getToken: () => {
          return "No token";
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default NoAuthProvider;
