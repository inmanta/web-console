import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PrimaryBaseUrlManager } from "@/UI/Routing";
import { AuthContext } from "../AuthContext";
import { clearLocalToken, getLocalToken, getLocalUsername, setLocalToken } from "./localToken";

/**
 * DatabaseAuthProvider component provides authentication functionality using a database.
 * It manages user authentication state, token management, and navigation.
 */
export const DatabaseAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const navigate = useNavigate();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();

  const getUser = (): string | null => user;

  const logout = useCallback((): void => {
    clearLocalToken();
    navigate(`${basePathname}/login`);
  }, [navigate, basePathname]);

  const login = (): void => {
    // The login function is called when we also get a 401 error.
    // This means that the user is not authenticated and
    // we need to clear the cookies to avoid lingering cookies that are invalid.
    clearLocalToken();
    navigate(`${basePathname}/login`);
  };

  const getToken = (): string | null => getLocalToken();

  const updateUser = (username: string, token: string) => {
    setUser(username);
    setLocalToken(username, token);
  };

  const isDisabled = () => !getToken();

  const isDatabaseSession = () => true;

  useEffect(() => {
    // If user is not set and token is present, set the user from the local storage or logs out. case where there is an user but not token is handled automatically as lacks of token prompt use to login again
    if (!user && getToken()) {
      const username = getLocalUsername();

      if (username) {
        setUser(username);
      } else {
        logout();
      }
    }
  }, [user, logout]);

  return (
    <AuthContext.Provider
      value={{ getUser, login, logout, updateUser, getToken, isDisabled, isDatabaseSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};
