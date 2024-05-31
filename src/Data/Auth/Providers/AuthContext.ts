import { createContext } from "react";
export interface AuthContextProps {
  user: string | undefined;
  login: () => void;
  logout: () => void;
  updateUser: (user: string, token: string) => void;
  getToken: () => string | null;
}
export const defaultAuthContext: AuthContextProps = {
  user: undefined,
  login: () => {},
  logout: () => {},
  updateUser: (_user: string, _token: string) => {},
  getToken: () => null,
};
export const AuthContext = createContext(defaultAuthContext);
