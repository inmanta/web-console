import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createCookie,
  getCookie,
  removeCookie,
} from "../../Common/CookieHelper";
import { AuthContext } from "../AuthContext";

/**
 * DatabaseAuthProvider component provides authentication functionality using a database.
 * It manages user authentication state, token management, and navigation.
 */
export const DatabaseAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<string | null>(null);
  const navigate = useNavigate();

  const getUser = (): string | null => user;

  const logout = (): void => {
    removeCookie("inmanta_user");
    localStorage.removeItem("inmanta_user");
    navigate("/login");
  };

  const login = (): void => navigate("/login");

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
    <AuthContext.Provider
      value={{ getUser, login, logout, updateUser, getToken, isDisabled }}
    >
      {children}
    </AuthContext.Provider>
  );
};
