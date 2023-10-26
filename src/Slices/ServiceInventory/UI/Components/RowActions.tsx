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
} from "@patternfly/react-core";
import { CopyIcon, EllipsisVIcon, ToolsIcon } from "@patternfly/react-icons";
import { DependencyContext, words } from "@/UI";
import { Link } from "@/UI/Components";
import { ServiceInstanceForAction } from "@/UI/Presenters";
import useFeatures from "@/UI/Utils/useFeatures";
import { DeleteAction } from "./MenuSections/DeleteAction";
import { DestroyAction } from "./MenuSections/DestroyAction";
import { ForceStateAction } from "./MenuSections/ForceStateAction/ForceStateAction";
import { NavigationDrillDown } from "./MenuSections/NavigationDrillDown/NavigationDrillDown";
import { SetStateSection } from "./MenuSections/SetStateSection/SetStateSection";

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

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    setMenuDrilledIn([]);
    setDrilldownPath([]);
    setActiveMenu("rootMenu");
  };

  const setHeight = (menuId: string, height: number) => {
    if (
      !menuHeights[menuId] ||
      (menuId !== "rootMenu" && menuHeights[menuId] !== height)
    ) {
      setMenuHeights({
        ...menuHeights,
        [menuId]: height,
      });
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
      onGetMenuHeight={setHeight}
    >
      <MenuContent menuHeight={`${menuHeights[activeMenu]}px`}>
        <MenuList>
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
          <MenuItem itemId="duplicate" icon={<CopyIcon />}>
            Duplicate
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
          <Divider component="li" />
          <NavigationDrillDown
            instance={instance}
            diagnoseDisabled={diagnoseDisabled}
            routeManager={routeManager}
          />
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
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      menu={menu}
      menuRef={menuRef}
      toggle={toggle}
      toggleRef={toggleRef}
      popperProps={{ position: "right" }}
    />
  );
};
