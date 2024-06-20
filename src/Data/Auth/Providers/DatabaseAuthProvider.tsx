import React, { useState } from "react";
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

  const getUser = () => user;

  const logout = () => {
    removeCookie("inmanta_user");
    localStorage.removeItem("inmanta_user");
    navigate("/login");
  };

  const login = () => navigate("/login");

  const getToken = () => getCookie("inmanta_user");

  const updateUser = (username: string, token: string) => {
    setUser(username);
    createCookie("inmanta_user", token, 1);
  };

  return (
    <AuthContext.Provider
      value={{ getUser, login, logout, updateUser, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
