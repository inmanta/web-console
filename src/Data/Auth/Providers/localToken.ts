import { createCookie, getCookie, removeCookie } from "../../Common/CookieHelper";

/**
 * Shared storage for a database (local) login session.
 *
 * The bearer token is kept in the `inmanta_user` cookie and the username in
 * localStorage under the same key. This is used both by the DatabaseAuthProvider
 * and, as a break-glass fallback, by the OIDC and JWT providers when the local
 * login fallback is enabled and the identity provider is unavailable.
 */
const LOCAL_SESSION_KEY = "inmanta_user";
const HOURS_TO_EXPIRE = 12;

/**
 * Return the bearer token of the active local session, or null if there is none.
 */
export const getLocalToken = (): string | null => getCookie(LOCAL_SESSION_KEY);

/**
 * Return the username of the active local session, or null if there is none.
 */
export const getLocalUsername = (): string | null => localStorage.getItem(LOCAL_SESSION_KEY);

/**
 * Persist a local session (bearer token + username).
 */
export const setLocalToken = (username: string, token: string): void => {
  localStorage.setItem(LOCAL_SESSION_KEY, username);
  createCookie(LOCAL_SESSION_KEY, token, HOURS_TO_EXPIRE);
};

/**
 * Clear the active local session.
 */
export const clearLocalToken = (): void => {
  removeCookie(LOCAL_SESSION_KEY);
  localStorage.removeItem(LOCAL_SESSION_KEY);
};
