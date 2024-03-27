import { PrimaryArchiveHelper, PrimaryAuthController } from "@/Data";
import {
  MockEnvironmentHandler,
  MockFeatureManager,
  MockFileManager,
  MockLimitedFeatureManager,
} from "@/Test/Mock";
import { PrimaryRouteManager, EnvironmentModifierImpl } from "@/UI";
import { UrlManagerImpl } from "@/UI/Utils";

const baseUrl = "";
const env = "env";
const routeManager = PrimaryRouteManager(baseUrl);
const featureManager = new MockFeatureManager();
const environmentModifier = EnvironmentModifierImpl();
const urlManager = new UrlManagerImpl(featureManager, baseUrl);
const environmentHandler = MockEnvironmentHandler(env);
const fileManager = new MockFileManager();
const archiveHelper = new PrimaryArchiveHelper(fileManager);
const authController = new PrimaryAuthController(
  undefined,
  undefined,
  undefined,
);

export const dependencies = {
  routeManager,
  featureManager,
  environmentModifier,
  urlManager,
  environmentHandler,
  archiveHelper,
  authController,
};

const limitedFeatureManager = new MockLimitedFeatureManager();
const limitedUrlManager = new UrlManagerImpl(limitedFeatureManager, baseUrl);

/**
 * Dependencies with limited feature manager and url manager
 * It is used to mock the dependencies in the case where some features are disabled
 * @type {Dependencies}
 */
export const limitedDependencies = {
  routeManager,
  featureManager: limitedFeatureManager,
  environmentModifier,
  urlManager: limitedUrlManager,
  environmentHandler,
  archiveHelper,
  authController,
};
