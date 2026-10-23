import { EyeIcon, PlusIcon, ToolsIcon } from "@patternfly/react-icons";
import {
  FeatureModule,
  InstanceLinkContext,
  LinkAction,
  OrchestratorProvider,
  words,
} from "@/Core";
import * as InstanceComposer from "@S/InstanceComposerCreator/Core/Route";
import * as InstanceComposerEditor from "@S/InstanceComposerEditor/Core/Route";
import * as InstanceComposerViewer from "@S/InstanceComposerViewer/Core/Route";
import { composerMessages } from "./messages";

const isComposerEnabled = (orchestratorProvider: OrchestratorProvider) =>
  orchestratorProvider.isComposerEnabled();

const editInComposer: LinkAction<InstanceLinkContext> = {
  id: "edit-composer",
  getLabel: () => words("instanceComposer.editButton"),
  icon: ToolsIcon,
  getUrl: (routeManager, { service, instance }) =>
    routeManager.getUrl("InstanceComposerEditor", { service, instance }),
  isVisible: isComposerEnabled,
  isDisabled: ({ editDisabled }) => editDisabled,
};

const showInComposer: LinkAction<InstanceLinkContext> = {
  id: "show-composer",
  getLabel: () => words("instanceComposer.showButton"),
  icon: EyeIcon,
  getUrl: (routeManager, { service, instance }) =>
    routeManager.getUrl("InstanceComposerViewer", { service, instance }),
};

/**
 * The Instance Composer. Its pages pull in @joint/plus, so they are not preloaded: they are only
 * fetched when a composer route is opened.
 */
export const composerFeature: FeatureModule = {
  id: "composer",
  version: APP_VERSION,
  messages: composerMessages,
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
  contributions: {
    "inventory.addInstance.actions": [
      {
        id: "add-instance-composer-button",
        getLabel: () => words("inventory.addInstance.composerButton"),
        icon: PlusIcon,
        getUrl: (routeManager, { service }) => routeManager.getUrl("InstanceComposer", { service }),
        isVisible: isComposerEnabled,
      },
    ],
    "inventory.row.actions": [editInComposer, { ...showInComposer, isVisible: isComposerEnabled }],
    // Without the composer license, the details page still offers the read-only view.
    "instance.actions": [
      editInComposer,
      {
        ...showInComposer,
        isVisible: (orchestratorProvider) => !isComposerEnabled(orchestratorProvider),
        // Kept from before the extension points: the read-only view is disabled whenever the
        // instance can't be updated, unlike the one in the inventory row menu.
        isDisabled: ({ editDisabled }) => editDisabled,
      },
    ],
  },
};
