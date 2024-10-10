import React, { useContext, useEffect, useState } from "react";
import { useGetCurrentUser } from "@/Data/Managers/V2/GETTERS/GetCurrentUser";
import { AuthContext } from "../AuthContext";

/**
 * Component that implements a authentication provider when jwt authentication is enabled.
 * In practice it fetches username from the backend because whole authentication flow is managed by 3rd party outside of the scope of our application.
 * User will open application already authorized and from our perspective the flow is almost identical as in case of no authorization.
 */
export const JwtAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<string | null>(null);
  const { data, isSuccess } = useGetCurrentUser().useOneTime();
  const authContext = useContext(AuthContext);

  const getUser = (): string | null => user;
  const isDisabled = () => true;

  useEffect(() => {
    if (isSuccess) {
      setUser(data?.username);
    }
  }, [data, isSuccess]);

  return (
    <AuthContext.Provider value={{ ...authContext, getUser, isDisabled }}>
      {children}
    </AuthContext.Provider>
  );
};
