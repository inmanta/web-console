import { createContext } from "react";
import { NavigationGroup, RouteKind } from "@inmanta/web-console-core";
import {
  KeycloakAuthConfig,
  LocalConfig,
  OidcAuthConfig,
} from "@inmanta/web-console-core/Auth/types";

/**
 * How the users of an app log in.
 */
export type AuthConfig = KeycloakAuthConfig | OidcAuthConfig | LocalConfig;

/**
 * A sidebar link that only this app adds, e.g. to its documentation. It opens in a new tab.
 */
export interface SidebarLink {
  group: NavigationGroup;
  label: string;
  href: string;
}

/**
 * How an app arranges the sidebar that its features fill.
 */
export interface SidebarOptions {
  /**
   * The order of the sidebar groups. Groups left out follow in their default order. Defaults to
   * the order of `NAVIGATION_GROUPS`.
   */
  order?: NavigationGroup[];

  /**
   * The sidebar entries this app leaves out. Their pages stay reachable by url.
   */
  hide?: RouteKind[];

  /**
   * Links this app adds, after the entries of its features in the same group.
   */
  links?: SidebarLink[];
}

/**
 * The options an app gives the shell. Leaving one out gives today's web console.
 */
export interface ShellOptions {
  /**
   * How users log in. Defaults to "from-config": the settings the orchestrator writes into
   * `config.js` (`window.auth`). With no settings there, the app has no login.
   */
  auth?: "from-config" | AuthConfig;

  /**
   * How the sidebar is arranged. Defaults to every entry of the features, grouped in the default
   * order.
   */
  sidebar?: SidebarOptions;
}

/**
 * The shell options of the running app, for the shell's own components.
 */
export const ShellOptionsContext = createContext<ShellOptions>({});
