import React, { useContext, useEffect, useState } from "react";
import { useGetCurrentUser } from "@/Data/Queries";
import { AuthContext } from "../AuthContext";
import { getLocalToken, getLocalUsername, setLocalToken } from "./localToken";

/**
 * Component that implements a authentication provider when jwt authentication is enabled.
 * In practice it fetches username from the backend because whole authentication flow is managed by 3rd party outside of the scope of our application.
 * User will open application already authorized and from our perspective the flow is almost identical as in case of no authorization.
 *
 * When a database local login fallback session is present (created via the /login form
 * when the proxy could not authenticate the user), its token and username take over,
 * and database user management becomes available.
 */
export const JwtAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<string | null>(getLocalUsername());
  const { data, isSuccess } = useGetCurrentUser().useOneTime();
  const authContext = useContext(AuthContext);

  const getUser = (): string | null => user;
  const getToken = (): string | null => getLocalToken();
  const updateUser = (username: string, token: string): void => {
    setLocalToken(username, token);
    setUser(username);
  };
  const isDisabled = () => !getUser();
  const isDatabaseSession = () => !!getLocalToken();

  useEffect(() => {
    if (isSuccess) {
      setUser(data?.username);
    }
  }, [data, isSuccess]);

  return (
    <AuthContext.Provider
      value={{ ...authContext, getUser, getToken, updateUser, isDisabled, isDatabaseSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};
