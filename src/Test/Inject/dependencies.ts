import { PrimaryArchiveHelper, PrimaryKeycloakController } from "@/Data";
import {
  MockEnvironmentHandler,
  MockFeatureManager,
  MockFileManager,
} from "@/Test/Mock";
import { PrimaryRouteManager, EnvironmentModifierImpl } from "@/UI";
import { UrlManagerImpl } from "@/UI/Utils";

const baseUrl = "";
const env = "env";
const routeManager = new PrimaryRouteManager(baseUrl);
const featureManager = new MockFeatureManager();
const environmentModifier = EnvironmentModifierImpl();
const urlManager = new UrlManagerImpl(featureManager, baseUrl);
const environmentHandler = MockEnvironmentHandler(env);
const fileManager = new MockFileManager();
const archiveHelper = new PrimaryArchiveHelper(fileManager);
const keycloakController = new PrimaryKeycloakController(
  undefined,
  undefined,
  undefined
);

export const dependencies = {
  routeManager,
  featureManager,
  environmentModifier,
  urlManager,
  environmentHandler,
  archiveHelper,
  keycloakController,
};
