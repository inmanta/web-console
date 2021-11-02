import { PrimaryStatusManager } from "@/Data";
import { MockEnvironmentHandler } from "@/Test/Mock";
import { PrimaryRouteManager, EnvironmentModifierImpl } from "@/UI";
import { UrlManagerImpl } from "@/UI/Utils";

const routeManager = new PrimaryRouteManager("");
const statusManager = new PrimaryStatusManager();
const environmentModifier = new EnvironmentModifierImpl();
const urlManager = new UrlManagerImpl(statusManager, "");
const environmentHandler = new MockEnvironmentHandler();

export const dependencies = {
  routeManager,
  statusManager,
  environmentModifier,
  urlManager,
  environmentHandler,
};
