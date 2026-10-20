import { FeatureModule } from "@/Core";
import * as InstanceComposer from "@S/InstanceComposerCreator/Core/Route";
import * as InstanceComposerEditor from "@S/InstanceComposerEditor/Core/Route";
import * as InstanceComposerViewer from "@S/InstanceComposerViewer/Core/Route";

/**
 * The Instance Composer. Its pages pull in @joint/plus, so they are not preloaded: they are only
 * fetched when a composer route is opened.
 */
export const composerFeature: FeatureModule = {
  id: "composer",
  version: APP_VERSION,
  licensedFeature: "ui.ui",
  preload: false,
  routes: [
    {
      route: InstanceComposer.route,
      page: () =>
        import("@S/InstanceComposerCreator/UI").then((module) => module.InstanceComposerPage),
    },
    {
      route: InstanceComposerEditor.route,
      page: () =>
        import("@S/InstanceComposerEditor/UI").then((module) => module.InstanceComposerEditorPage),
    },
    {
      route: InstanceComposerViewer.route,
      page: () =>
        import("@S/InstanceComposerViewer/UI").then((module) => module.InstanceComposerViewerPage),
    },
  ],
};
