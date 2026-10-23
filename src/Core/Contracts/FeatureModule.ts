import { ComponentType } from "react";
import { RouteFactory, RouteKind } from "@/Core/Domain";
import { Messages } from "@/Core/I18n";
import { Feature, OrchestratorProvider } from "./OrchestratorProvider";

/**
 * The contract every feature exports. The app only knows its features through this object:
 * it builds the route table, the pages and the sidebar from the list of `FeatureModule`s it is
 * given, so leaving a feature out of that list removes it from the app.
 */
export interface FeatureModule {
  /**
   * Unique id of the feature, e.g. "composer" or "lsm".
   */
  id: string;

  /**
   * The version the feature was built with. Checked against the host when the feature is loaded
   * as a runtime plugin.
   */
  version: string;

  /**
   * The licensed feature this feature needs. When the license doesn't include it, the feature's
   * sidebar entries are hidden. Its pages stay registered, so they can explain the license is
   * missing.
   */
  licensedFeature?: Feature;

  /**
   * The routes of the feature, each with the page it renders. A url resolves to the first
   * registered route whose path matches it.
   */
  routes: FeatureRoute[];

  /**
   * Whether the app fetches the pages of the feature in the background once it is idle, so they
   * open without a loading view. Defaults to true. A feature with heavy pages that most users
   * never open turns it off, so its code is only fetched when one of its pages is opened.
   */
  preload?: boolean;

  /**
   * The entries the feature adds to the sidebar.
   */
  navigation?: NavigationEntry[];

  /**
   * What the feature contributes to the extension points of other features.
   */
  contributions?: Partial<Contributions>;

  /**
   * The English messages of the feature, registered with `registerMessages` when the app starts.
   * English is the default language and the fallback of every other one. Their keys are added to
   * `WordsRegistry` next to the messages.
   */
  messages?: Messages;
}

/**
 * Loads a page. Pages are loaded lazily, so a page's code is only fetched when it is opened.
 */
export type PageLoader = () => Promise<ComponentType>;

export interface FeatureRoute {
  route: RouteFactory;
  page: PageLoader;
}

/**
 * The groups of the sidebar, in the order they are shown.
 */
export const NAVIGATION_GROUPS = [
  "environment",
  "lifecycleServiceManager",
  "orchestrationEngine",
  "resourceManager",
] as const;

export type NavigationGroup = (typeof NAVIGATION_GROUPS)[number];

/**
 * A sidebar link to a route without params. Entries are shown in the order of the features, then
 * in the order a feature lists them.
 */
export interface NavigationEntry {
  kind: RouteKind;
  group: NavigationGroup;

  /**
   * Shows the compilation indicator next to the link.
   */
  statusIndication?: boolean;

  /**
   * Hides the link when it returns false, e.g. when an extension or licensed feature it depends
   * on is not enabled.
   */
  isVisible?: (orchestratorProvider: OrchestratorProvider) => boolean;
}

/**
 * The open registry of extension points: maps each extension point to the type of what is
 * contributed to it. Extension points are added through declaration merging, the same way as
 * `RouteRegistry`: by the feature that owns them, or in `Core/Contracts/ExtensionPoints.ts` when
 * other features must contribute to them without importing the owner.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExtensionPointRegistry {}

export type Contributions = {
  [K in keyof ExtensionPointRegistry]: ExtensionPointRegistry[K][];
};

/**
 * Returns the routes of the given features, in order.
 *
 * @param features - the features to take the routes of
 * @returns the route factories of every route of these features
 */
export const getFeatureRoutes = (features: FeatureModule[]): RouteFactory[] =>
  features.flatMap((feature) => feature.routes.map(({ route }) => route));
