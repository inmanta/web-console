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
  FileMedicalAltIcon,
  HistoryIcon,
  PortIcon,
  ToolsIcon,
} from "@patternfly/react-icons";
import { DependencyContext, words } from "@/UI";
import { Link } from "@/UI/Components";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import useFeatures from "@/UI/Utils/useFeatures";
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
  const { routeManager, environmentModifier } = useContext(DependencyContext);
  const features = useFeatures();

  const [activeMenu, setActiveMenu] = React.useState<string>("rootMenu");
  const [menuDrilledIn, setMenuDrilledIn] = React.useState<string[]>([]);
  const [drilldownPath, setDrilldownPath] = React.useState<string[]>([]);
  const [menuHeights, setMenuHeights] = React.useState<MenuHeightsType>({});

  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // the height of the drilled down menus differ based on how many options preceeds the drilldown. This is a bug on PF side.
  // and setting the insetHeight manually is a workaround for that issue.
  const getInsetHeight = () => {
    // -100 for each default option present above the first drilldown that is enabled.
    // diagnose and duplicate are always enabled, so this means it starts at -200
    let insetHeight = -200;
    if (features && features.includes("instanceComposer") && !editDisabled) {
      insetHeight = insetHeight - 100;
    }
    if (!editDisabled) {
      insetHeight = insetHeight - 100;
    }
    if (diagnoseDisabled) {
      insetHeight = insetHeight + 100;
    }

    return `${insetHeight}%`;
  };

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
          <Link
            pathname={routeManager.getUrl("Diagnose", {
              service: instance.service_entity,
              instance: instance.id,
            })}
            isDisabled={diagnoseDisabled}
          >
            <MenuItem
              itemId="diagnose"
              isDisabled={diagnoseDisabled}
              icon={<FileMedicalAltIcon />}
            >
              {words("inventory.statustab.diagnose")}
            </MenuItem>
          </Link>
          {features && features.includes("instanceComposer") && (
            <Link
              pathname={routeManager.getUrl("InstanceComposerEditor", {
                service: instance.service_entity,
                instance: instance.id,
              })}
              isDisabled={editDisabled}
            >
              <MenuItem
                itemId="edit-composer"
                isDisabled={editDisabled}
                icon={<ToolsIcon />}
              >
                {words("inventory.instanceComposer.editButton")}
              </MenuItem>
            </Link>
          )}
          <Link
            pathname={routeManager.getUrl("EditInstance", {
              service: instance.service_entity,
              instance: instance.id,
            })}
            isDisabled={editDisabled}
          >
            <MenuItem
              itemId="edit"
              isDisabled={editDisabled}
              icon={<ToolsIcon />}
            >
              {words("inventory.editInstance.button")}
            </MenuItem>
          </Link>
          <Link
            pathname={routeManager.getUrl("DuplicateInstance", {
              service: instance.service_entity,
              instance: instance.id,
            })}
          >
            <MenuItem itemId="duplicate" icon={<CopyIcon />}>
              Duplicate
            </MenuItem>
          </Link>
          <Divider component="li" />
          <MenuItem
            itemId="group:navigate"
            direction="down"
            drilldownMenu={
              <DrilldownMenu
                id="navigateDrillDown"
                aria-label="navigationDrilldown"
                style={{ insetBlockStart: getInsetHeight() }}
              >
                <MenuItem
                  itemId="group:navigate_breadcrumb"
                  direction="up"
                  aria-hidden
                >
                  Back
                </MenuItem>
                <Divider component="li" />
                <Link
                  pathname={routeManager.getUrl("History", {
                    service: instance.service_entity,
                    instance: instance.id,
                  })}
                >
                  <MenuItem itemId="history" icon={<HistoryIcon />}>
                    {words("inventory.statusTab.history")}
                  </MenuItem>
                </Link>
                <Link
                  pathname={routeManager.getUrl("Events", {
                    service: instance.service_entity,
                    instance: instance.id,
                  })}
                >
                  <MenuItem itemId="events" icon={<PortIcon />}>
                    {words("inventory.statusTab.events")}
                  </MenuItem>
                </Link>
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
              insetHeight={getInsetHeight()}
              instance_identity={
                instance.service_identity_attribute_value ?? instance.id
              }
              version={instance.version}
              availableStates={availableStates}
            />
          )}
          <Divider component="li" />
          <MenuGroup label="Set state">
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
