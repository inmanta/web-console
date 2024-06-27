import React, { useContext, useEffect, useState } from "react";
import { useGetCurrentUser } from "@/Data/Managers/V2/RemoveUser";
import { AuthContext } from "../AuthContext";
/**
 * Component that implements a null authentication provider when no authentication is enabled.
 */
export const JwtProvider: React.FC<React.PropsWithChildren> = ({
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
