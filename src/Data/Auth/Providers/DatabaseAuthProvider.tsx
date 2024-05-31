import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createCookie,
  getCookie,
  removeCookie,
} from "../../Common/CookieHelper";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

const DatabaseAuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

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
    <AuthContext.Provider value={{ user, login, logout, updateUser, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default DatabaseAuthProvider;
