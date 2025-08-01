import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PrimaryBaseUrlManager } from "@/UI/Routing";
import { createCookie, getCookie, removeCookie } from "../../Common/CookieHelper";
import { AuthContext } from "../AuthContext";

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

  const clearCookies = (): void => {
    removeCookie("inmanta_user");
    localStorage.removeItem("inmanta_user");
  };

  const getUser = (): string | null => user;

  const logout = useCallback((): void => {
    clearCookies();
    navigate(`${basePathname}/login`);
  }, [navigate, basePathname]);

  const login = (): void => {
    // The login function is called when we also get a 401 error.
    // This means that the user is not authenticated and
    // we need to clear the cookies to avoid lingering cookies that are invalid.
    clearCookies();
    navigate(`${basePathname}/login`);
  };

  const getToken = (): string | null => getCookie("inmanta_user");

  const updateUser = (username: string, token: string) => {
    setUser(username);
    localStorage.setItem("inmanta_user", username);
    createCookie("inmanta_user", token, 1);
  };

  const isDisabled = () => !getToken();

  useEffect(() => {
    // If user is not set and token is present, set the user from the local storage or logs out. case where there is an user but not token is handled automatically as lacks of token prompt use to login again
    if (!user && getToken()) {
      const username = localStorage.getItem("inmanta_user");

      if (username) {
        setUser(username);
      } else {
        logout();
      }
    }
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ getUser, login, logout, updateUser, getToken, isDisabled }}>
      {children}
    </AuthContext.Provider>
  );
};
