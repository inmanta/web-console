import { PrimaryFeatureManager } from "@/Data";
import { PrimaryRouteManager, EnvironmentModifierImpl } from "@/UI";
import { UrlManagerImpl } from "@/UI/Utils";

const routeManager = new PrimaryRouteManager("");
const featureManager = new PrimaryFeatureManager();
const environmentModifier = new EnvironmentModifierImpl();
const urlManager = new UrlManagerImpl(featureManager, "");

export const dependencies = {
  routeManager,
  featureManager,
  environmentModifier,
  urlManager,
};
