import { MockEnvironmentHandler, MockFeatureManager } from "@/Test/Mock";
import { PrimaryRouteManager, EnvironmentModifierImpl } from "@/UI";
import { UrlManagerImpl } from "@/UI/Utils";

const routeManager = new PrimaryRouteManager("");
const featureManager = new MockFeatureManager();
const environmentModifier = new EnvironmentModifierImpl();
const urlManager = new UrlManagerImpl(featureManager, "");
const environmentHandler = new MockEnvironmentHandler();

export const dependencies = {
  routeManager,
  featureManager,
  environmentModifier,
  urlManager,
  environmentHandler,
};
