import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { PrimaryBaseUrlManager } from "@/UI/Routing";
import { AuthContext } from "../AuthContext";
import { clearLocalToken, getLocalToken, getLocalUsername, setLocalToken } from "./localToken";

/** Persisted expiry (absolute epoch ms) of the current session token, used to schedule renewal. */
const SESSION_EXPIRY_KEY = "inmanta_session_expiry";

/** Renew this long before the session expires, so an in-flight request never races the expiry. */
const RENEWAL_BUFFER_MS = 60 * 1000;

/**
 * DatabaseAuthProvider component provides authentication functionality using a database.
 * It manages user authentication state, token management, and navigation.
 *
 * Login sessions expire server-side (see server.login_session_expire). To keep an active user from being
 * logged out mid-session, the provider renews the token shortly before it expires by calling the
 * /api/v2/login/renew endpoint, mirroring the silent renewal the OIDC and Keycloak providers already do.
 *
 * The renewal timer is managed imperatively (a ref, not React state) on purpose: renewing a token does not
 * change any state a consumer renders, and bumping state on every token change would re-fire effects that
 * depend on the auth context (e.g. the login form's redirect effect) in a loop.
 */
export const DatabaseAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const navigate = useNavigate();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();

  // The pending renewal timer, and a ref to the latest renew() so the timer always runs the current one.
  const renewalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renewRef = useRef<() => void>(() => {});

  const clearRenewalTimer = useCallback((): void => {
    if (renewalTimer.current !== null) {
      clearTimeout(renewalTimer.current);
      renewalTimer.current = null;
    }
  }, []);

  const clearSession = useCallback((): void => {
    clearRenewalTimer();
    clearLocalToken();
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  }, [clearRenewalTimer]);

  const getUser = (): string | null => user;

  const logout = useCallback((): void => {
    clearSession();
    navigate(`${basePathname}/login`);
  }, [navigate, basePathname, clearSession]);

  const login = (): void => {
    // The login function is called when we also get a 401 error.
    // This means that the user is not authenticated and
    // we need to clear the cookies to avoid lingering cookies that are invalid.
    clearSession();
    navigate(`${basePathname}/login`);
  };

  const getToken = (): string | null => getLocalToken();

  /**
   * (Re)arm the one-shot renewal timer for a token that expires at expiryMs (absolute epoch ms), or clear it
   * when there is no expiry.
   */
  const armRenewal = useCallback(
    (expiryMs: number | null): void => {
      clearRenewalTimer();
      if (expiryMs === null) {
        return;
      }
      const delay = Math.max(expiryMs - Date.now() - RENEWAL_BUFFER_MS, 0);
      renewalTimer.current = setTimeout(() => renewRef.current(), delay);
    },
    [clearRenewalTimer]
  );

  /**
   * Store a freshly issued session (token + username), persist its expiry (so renewal survives a reload),
   * and arm the renewal timer.
   */
  const persistSession = useCallback(
    (username: string, token: string, expiresIn: number | null): void => {
      setLocalToken(username, token);
      if (typeof expiresIn === "number" && expiresIn > 0) {
        const expiryMs = Date.now() + expiresIn * 1000;

        localStorage.setItem(SESSION_EXPIRY_KEY, String(expiryMs));
        armRenewal(expiryMs);
      } else {
        // A session without an expiry does not need renewal.
        localStorage.removeItem(SESSION_EXPIRY_KEY);
        armRenewal(null);
      }
    },
    [armRenewal]
  );

  const updateUser = (username: string, token: string, expiresIn: number | null = null): void => {
    setUser(username);
    persistSession(username, token, expiresIn);
  };

  /**
   * Exchange the current, still-valid session token for a fresh one. On success the new token and expiry are
   * stored and the timer re-arms; on any failure the session ends, sending the user to the login page.
   */
  const renew = useCallback(async (): Promise<void> => {
    const token = getLocalToken();
    const username = getLocalUsername();

    if (!token || !username) {
      return;
    }

    try {
      const baseUrl = new PrimaryBaseUrlManager(
        globalThis.location.origin,
        globalThis.location.pathname
      ).getBaseUrl();
      const response = await fetch(`${baseUrl}/api/v2/login/renew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Session renewal failed with status ${response.status}`);
      }

      const body = await response.json();

      persistSession(username, body.data.token, body.data.expires_in ?? null);
    } catch {
      logout();
    }
  }, [persistSession, logout]);

  const isDatabaseSession = () => true;

  useEffect(() => {
    renewRef.current = () => {
      void renew();
    };
  }, [renew]);

  useEffect(() => {
    // Restore the session on load: if a token is present, set the user and arm renewal from the persisted
    // expiry. A missing username means the session is unusable, so log out.
    if (!user && getLocalToken()) {
      const username = getLocalUsername();

      if (username) {
        setUser(username);
        const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);

        armRenewal(expiry ? Number(expiry) : null);
      } else {
        logout();
      }
    }
  }, [user, logout, armRenewal]);

  // Clear any pending renewal when the provider unmounts.
  useEffect(() => clearRenewalTimer, [clearRenewalTimer]);

  const isDisabled = () => !getToken();

  return (
    <AuthContext.Provider
      value={{ getUser, login, logout, updateUser, getToken, isDisabled, isDatabaseSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};
