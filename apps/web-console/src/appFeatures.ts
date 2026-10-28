import { environmentFeature } from "@/Features/Environment";
import { graphiqlFeature } from "@/Features/GraphiQL";
import { lsmFeature } from "@/Features/Lsm";
import { orchestrationEngineFeature } from "@/Features/OrchestrationEngine";
import { resourceManagerFeature } from "@/Features/ResourceManager";
import { userManagementFeature } from "@/Features/UserManagement";
import { FeatureModule, getFeatureRoutes, RouteFactory } from "@inmanta/web-console-core";
import { composerFeature } from "@inmanta/web-console-feature-composer";
import { shellFeature } from "@inmanta/web-console-shell/shellFeature";

/**
 * The features this app ships. The route table, pages and sidebar are built from this list, so a
 * feature that is left out is absent from the app.
 *
 * `shellFeature` and `environmentFeature` must always be registered: the shell links to their
 * pages without checking `routeManager.has`.
 *
 * Order matters: a url resolves to the first route whose path matches it, and sidebar entries
 * follow the order of the features.
 */
export const features: FeatureModule[] = [
  shellFeature,
  environmentFeature,
  graphiqlFeature,
  userManagementFeature,
  lsmFeature,
  composerFeature,
  resourceManagerFeature,
  orchestrationEngineFeature,
];

/**
 * The routes of the features this app ships.
 */
export const routes: RouteFactory[] = getFeatureRoutes(features);
