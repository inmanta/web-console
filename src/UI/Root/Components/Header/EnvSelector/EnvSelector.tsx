import React, { useContext } from "react";
import {
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
} from "@patternfly/react-core";
import { UserCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Profile } from "../Actions/Profile";

interface Props {
  items: string[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleText: string;
}

export const EnvSelector: React.FC<Props> = ({
  items,
  onSelect,
  isOpen,
  setIsOpen,
  toggleText,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const { keycloakController } = useContext(DependencyContext);

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          id="toggle-button"
          ref={toggleRef}
          isExpanded={isOpen}
          aria-label="menu-toggle"
          isFullHeight
          onClick={() => setIsOpen(!isOpen)}
          icon={keycloakController.isEnabled() ? <UserCircleIcon /> : null}
        >
          {keycloakController.isEnabled() ? (
            <StyledDiv>
              <div>
                <Profile />
                <div>
                  {toggleText.length > 28
                    ? toggleText.slice(0, 20) + "..."
                    : toggleText}
                </div>
              </div>
            </StyledDiv>
          ) : (
            <>
              {toggleText.length > 28
                ? toggleText.slice(0, 20) + "..."
                : toggleText}
            </>
          )}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownGroup
          label={words("home.environment.selector")}
          key="envs-group"
        >
          {items.map((item, index) => (
            <DropdownItem
              onClick={() => onSelect(item)}
              key={`env-${index}-${item}`}
            >
              {item.length > 28 ? item.slice(0, 20) + "..." : item}
            </DropdownItem>
          ))}
        </DropdownGroup>
        <div key="overview-link">
          <Divider />
          <Tooltip content={words("home.navigation.tooltip")} entryDelay={500}>
            <DropdownItem to={routeManager.getUrl("Home", undefined)}>
              {words("home.navigation.button")}
            </DropdownItem>
          </Tooltip>
          {keycloakController.isEnabled() && (
            <DropdownItem
              onClick={() => keycloakController.getInstance().logout()}
            >
              {words("dashboard.logout")}
            </DropdownItem>
          )}
        </div>
      </DropdownList>
    </Dropdown>
  );
};

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
`;
