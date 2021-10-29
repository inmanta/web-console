import { PrimaryFeatureManager } from "@/Data";
import { PrimaryRouteManager, EnvironmentModifierImpl } from "@/UI";

export const dependencies = {
  routeManager: new PrimaryRouteManager(""),
  featureManager: new PrimaryFeatureManager(),
  environmentModifier: new EnvironmentModifierImpl(),
};
