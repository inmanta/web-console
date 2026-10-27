import { ComponentType } from "react";
import { OrchestratorProvider } from "./OrchestratorProvider";
import { RouteManager } from "./RouteManager";

/**
 * A link a feature adds to a menu of another feature. The feature that owns the menu renders it,
 * so it looks the same as the menu's own items.
 *
 * @template Context - what the menu is about, passed to the callbacks of the link
 */
export interface LinkAction<Context> {
  /**
   * Identifies the menu item, e.g. as its React key. A menu may also use it as the item's DOM id,
   * so it must be unique within the extension point.
   */
  id: string;

  /**
   * Returns the text of the menu item. It is a function, so the message is looked up when the
   * menu renders, once the messages are registered.
   */
  getLabel: () => string;

  /**
   * The icon shown before the label.
   */
  icon: ComponentType;

  /**
   * Returns the pathname the link opens, e.g. with `routeManager.getUrl`. The link keeps the
   * current query string, so the environment stays selected.
   */
  getUrl: (routeManager: RouteManager, context: Context) => string;

  /**
   * Hides the link when it returns false, e.g. when the license doesn't include the feature.
   */
  isVisible?: (orchestratorProvider: OrchestratorProvider) => boolean;

  /**
   * Disables the link when it returns true: it is still shown, but greyed out and not clickable.
   */
  isDisabled?: (context: Context) => boolean;
}

/**
 * Whether a link is shown, according to its `isVisible`. A link without `isVisible` is always
 * shown.
 *
 * @param action - the link
 * @param orchestratorProvider - the features and license of the orchestrator
 * @returns true when the link is shown
 */
export const isLinkActionVisible = (
  { isVisible }: Pick<LinkAction<never>, "isVisible">,
  orchestratorProvider: OrchestratorProvider
): boolean => isVisible === undefined || isVisible(orchestratorProvider);

/**
 * What the links of the "Add instance" button of the service inventory are about.
 */
export interface ServiceLinkContext {
  service: string;
}

/**
 * What the links of the action menus of a service instance are about.
 */
export interface InstanceLinkContext {
  service: string;
  instance: string;

  /**
   * True when the instance can't be updated, e.g. because it is deleted or its state has no
   * update transfer.
   */
  editDisabled: boolean;
}

/**
 * The extension points of the lsm feature. They are declared in core instead of in lsm, so a
 * feature can contribute to them without importing lsm.
 */
declare module "@inmanta/web-console-core/Contracts/FeatureModule" {
  interface ExtensionPointRegistry {
    /**
     * Extra ways to add an instance on the service inventory. When there are any, the "Add
     * instance" button becomes a split button with these links in its dropdown.
     */
    "inventory.addInstance.actions": LinkAction<ServiceLinkContext>;

    /**
     * Links in the row menu of an instance in the service inventory.
     */
    "inventory.row.actions": LinkAction<InstanceLinkContext>;

    /**
     * Links at the top of the Actions menu on the instance details page.
     */
    "instance.actions": LinkAction<InstanceLinkContext>;
  }
}
