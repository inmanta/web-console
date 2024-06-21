import { createContext } from "react";

/**
 * Interface for the authentication context properties.
 */
export interface AuthContextInterface {
  /**
   * Function to get the current user.
   * @returns The current user, or undefined if no user is logged in.
   */
  getUser: () => string | null;

  /**
   * Function to log in a user.
   */
  login: () => void;

  /**
   * Function to log out the current user.
   */
  logout: () => void;

  /**
   * Function to update the current user and their token.
   * @param user - The new user.
   * @param token - The new token.
   */
  updateUser: (user: string, token: string) => void;

  /**
   * Function to get the current user's token.
   * @returns The current user's token, or undefined if no user is logged in.
   */
  getToken: () => string | undefined;

  /**
   * Function to check whether Authentication is Disabled.
   * @returns the boolean.
   */
  isDisabled: () => boolean;
}

/**
 * The default values for the authentication context.
 */
export const defaultAuthContext: AuthContextInterface = {
  getUser: () => null,
  login: () => {},
  logout: () => {},
  updateUser: (_user: string, _token: string) => {},
  getToken: () => undefined,
  isDisabled: () => true,
};

/**
 * The authentication context.
 */
export const AuthContext =
  createContext<AuthContextInterface>(defaultAuthContext);
