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
   * Unique within the extension point. Used as the id of the menu item.
   */
  id: string;
  getLabel: () => string;
  icon: ComponentType;
  getUrl: (routeManager: RouteManager, context: Context) => string;

  /**
   * Hides the link when it returns false, e.g. when the license doesn't include the feature.
   */
  isVisible?: (orchestratorProvider: OrchestratorProvider) => boolean;
  isDisabled?: (context: Context) => boolean;
}

/**
 * The context of the "Add instance" button of the service inventory.
 */
export interface ServiceContext {
  service: string;
}

/**
 * The context of the action menus of a service instance.
 */
export interface InstanceContext {
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
declare module "@/Core/Contracts/FeatureModule" {
  interface ExtensionPointRegistry {
    /**
     * Extra ways to add an instance on the service inventory. When there are any, the "Add
     * instance" button becomes a split button with these links in its dropdown.
     */
    "inventory.addInstance.actions": LinkAction<ServiceContext>;

    /**
     * Links in the row menu of an instance in the service inventory.
     */
    "inventory.row.actions": LinkAction<InstanceContext>;

    /**
     * Links at the top of the Actions menu on the instance details page.
     */
    "instance.actions": LinkAction<InstanceContext>;
  }
}
