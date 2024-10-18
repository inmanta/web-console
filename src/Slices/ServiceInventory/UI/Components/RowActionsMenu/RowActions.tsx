import React, { useContext, useEffect } from "react";
import {
  Divider,
  MenuToggle,
  MenuList,
  MenuItem,
  Menu,
  MenuContainer,
  MenuContent,
  MenuGroup,
  DrilldownMenu,
} from "@patternfly/react-core";
import {
  CopyIcon,
  EllipsisVIcon,
  EyeIcon,
  FileMedicalAltIcon,
  HistoryIcon,
  InfoAltIcon,
  PortIcon,
  ToolsIcon,
} from "@patternfly/react-icons";
import { DependencyContext, words } from "@/UI";
import { Link } from "@/UI/Components";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import { DeleteAction } from "./DeleteAction";
import { DestroyAction } from "./DestroyAction";
import { ForceStateAction } from "./ForceStateAction/ForceStateAction";
import { SetStateSection } from "./SetStateSection/SetStateSection";

interface MenuHeightsType {
  [id: string]: number;
}

export interface InstanceActionsProps {
  instance: ServiceInstanceForAction;
  editDisabled: boolean;
  deleteDisabled: boolean;
  diagnoseDisabled: boolean;
  availableStates: string[];
}

export const RowActions: React.FunctionComponent<InstanceActionsProps> = ({
  instance,
  editDisabled,
  deleteDisabled,
  diagnoseDisabled,
  availableStates,
}) => {
  const { routeManager, environmentModifier, featureManager } =
    useContext(DependencyContext);

  const [activeMenu, setActiveMenu] = React.useState<string>("rootMenu");
  const [menuDrilledIn, setMenuDrilledIn] = React.useState<string[]>([]);
  const [drilldownPath, setDrilldownPath] = React.useState<string[]>([]);
  const [menuHeights, setMenuHeights] = React.useState<MenuHeightsType>({});

  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const composerEnabled = featureManager.isComposerEnabled();

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    setMenuDrilledIn([]);
    setDrilldownPath([]);
    setActiveMenu("rootMenu");
  };

  const updateHeights = (menuId: string, height: number) => {
    if (
      !menuHeights[menuId] &&
      menuId !== "rootMenu" &&
      menuHeights[menuId] !== height
    ) {
      if (isOpen && menuId === activeMenu) {
        setMenuHeights({
          ...menuHeights,
          [menuId]: height,
        });
      }
    }
  };

  // reset the height of the container when the state is updated.
  useEffect(() => {
    setMenuHeights({});
  }, [instance.state]);

  const drillIn = (
    _event: React.KeyboardEvent | React.MouseEvent,
    fromMenuId: string,
    toMenuId: string,
    pathId: string,
  ) => {
    setMenuDrilledIn([...menuDrilledIn, fromMenuId]);
    setDrilldownPath([...drilldownPath, pathId]);
    setActiveMenu(toMenuId);
  };

  const drillOut = (
    _event: React.KeyboardEvent | React.MouseEvent,
    toMenuId: string,
  ) => {
    setMenuDrilledIn(menuDrilledIn.slice(0, menuDrilledIn.length - 1));
    setDrilldownPath(drilldownPath.slice(0, drilldownPath.length - 1));
    setActiveMenu(toMenuId);
  };

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      aria-label="row actions toggle"
      variant="plain"
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <EllipsisVIcon />
    </MenuToggle>
  );

  const menu = (
    <Menu
      id="rootMenu"
      containsDrilldown
      drilldownItemPath={drilldownPath}
      drilledInMenus={menuDrilledIn}
      activeMenu={activeMenu}
      onDrillIn={drillIn}
      onDrillOut={drillOut}
      ref={menuRef}
      style={{ width: "250px" }}
      onGetMenuHeight={updateHeights}
    >
      <MenuContent menuHeight={`${menuHeights[activeMenu]}px`}>
        <MenuList>
          <MenuItem itemId="instance-details" icon={<InfoAltIcon />}>
            <Link
              variant="plain"
              pathname={routeManager.getUrl("InstanceDetails", {
                service: instance.service_entity,
                instance:
                  instance.service_identity_attribute_value || instance.id,
                instanceId: instance.id,
              })}
            >
              {words("instanceDetails.button")}
            </Link>
          </MenuItem>
          <MenuItem
            itemId="diagnose"
            isDisabled={diagnoseDisabled}
            icon={<FileMedicalAltIcon />}
          >
            <Link
              variant="plain"
              pathname={routeManager.getUrl("Diagnose", {
                service: instance.service_entity,
                instance: instance.id,
              })}
              isDisabled={diagnoseDisabled}
            >
              {words("inventory.statustab.diagnose")}
            </Link>
          </MenuItem>
          {composerEnabled && (
            <MenuItem
              itemId="edit-composer"
              isDisabled={editDisabled}
              icon={<ToolsIcon />}
            >
              <Link
                variant="plain"
                pathname={routeManager.getUrl("InstanceComposerEditor", {
                  service: instance.service_entity,
                  instance: instance.id,
                })}
                isDisabled={editDisabled}
              >
                {words("instanceComposer.editButton")}
              </Link>
            </MenuItem>
          )}
          {featureManager.isComposerEnabled() && (
            <MenuItem itemId="show-composer" icon={<EyeIcon />}>
              <Link
                variant="plain"
                pathname={routeManager.getUrl("InstanceComposerViewer", {
                  service: instance.service_entity,
                  instance: instance.id,
                })}
              >
                {words("instanceComposer.showButton")}
              </Link>
            </MenuItem>
          )}

          <MenuItem
            itemId="edit"
            isDisabled={editDisabled}
            icon={<ToolsIcon />}
          >
            <Link
              variant="plain"
              pathname={routeManager.getUrl("EditInstance", {
                service: instance.service_entity,
                instance: instance.id,
              })}
              isDisabled={editDisabled}
            >
              {words("inventory.editInstance.button")}
            </Link>
          </MenuItem>

          <MenuItem itemId="duplicate" icon={<CopyIcon />}>
            <Link
              variant="plain"
              pathname={routeManager.getUrl("DuplicateInstance", {
                service: instance.service_entity,
                instance: instance.id,
              })}
            >
              {words("inventory.duplicateInstance.button")}
            </Link>
          </MenuItem>
          <Divider component="li" />
          <MenuItem
            itemId="group:navigate"
            direction="down"
            drilldownMenu={
              <DrilldownMenu
                id="navigateDrillDown"
                aria-label="navigationDrilldown"
              >
                <MenuItem
                  itemId="group:navigate_breadcrumb"
                  direction="up"
                  aria-hidden
                >
                  {words("back")}
                </MenuItem>
                <Divider component="li" />
                <MenuItem itemId="history" icon={<HistoryIcon />}>
                  <Link
                    variant="plain"
                    pathname={routeManager.getUrl("History", {
                      service: instance.service_entity,
                      instance: instance.id,
                    })}
                  >
                    {words("inventory.statusTab.history")}
                  </Link>
                </MenuItem>
                <MenuItem itemId="events" icon={<PortIcon />}>
                  <Link
                    variant="plain"
                    pathname={routeManager.getUrl("Events", {
                      service: instance.service_entity,
                      instance: instance.id,
                    })}
                  >
                    {words("inventory.statusTab.events")}
                  </Link>
                </MenuItem>
                <DeleteAction
                  isDisabled={deleteDisabled}
                  service_entity={instance.service_entity}
                  instance_identity={
                    instance.service_identity_attribute_value ?? instance.id
                  }
                  id={instance.id}
                  version={instance.version}
                />
                {environmentModifier.useIsExpertModeEnabled() && (
                  <DestroyAction
                    service_entity={instance.service_entity}
                    instance_identity={
                      instance.service_identity_attribute_value ?? instance.id
                    }
                    id={instance.id}
                    version={instance.version}
                  />
                )}
              </DrilldownMenu>
            }
          >
            {words("inventory.actions.drilldown")}
          </MenuItem>
          {environmentModifier.useIsExpertModeEnabled() && (
            <ForceStateAction
              service_entity={instance.service_entity}
              id={instance.id}
              instance_identity={
                instance.service_identity_attribute_value ?? instance.id
              }
              version={instance.version}
              availableStates={availableStates}
            />
          )}
          <Divider component="li" />
          <MenuGroup label="Set state" role="group">
            <SetStateSection
              service_entity={instance.service_entity}
              id={instance.id}
              instance_identity={
                instance.service_identity_attribute_value ?? instance.id
              }
              version={instance.version}
              targets={instance.instanceSetStateTargets}
              onClose={() => setIsOpen(false)}
            />
          </MenuGroup>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <MenuContainer
      isOpen={isOpen}
      aria-label={`menu-${instance.id}`}
      data-testid={`menu-${instance.id}`}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      menu={menu}
      menuRef={menuRef}
      toggle={toggle}
      toggleRef={toggleRef}
      popperProps={{ position: "right" }}
    />
  );
};
