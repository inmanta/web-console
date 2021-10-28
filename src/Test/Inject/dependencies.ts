import { PrimaryFeatureManager } from "@/Data";
import {
  PrimaryRouteManager,
  Dependencies,
  EnvironmentModifierImpl,
} from "@/UI";

export const dependencies: Partial<Dependencies> = {
  routeManager: new PrimaryRouteManager(""),
  featureManager: new PrimaryFeatureManager(),
  environmentModifier: new EnvironmentModifierImpl(),
};
