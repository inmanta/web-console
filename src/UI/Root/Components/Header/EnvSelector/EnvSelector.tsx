import React, { useContext } from "react";
import {
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  TextContent,
  Tooltip,
} from "@patternfly/react-core";
import { UserCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { KeycloakName } from "../Actions/KeycloakName";

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
  const { authController } = useContext(DependencyContext);
  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          id="toggle-button"
          ref={toggleRef}
          isExpanded={isOpen}
          aria-label={toggleText}
          isFullHeight
          onClick={() => setIsOpen(!isOpen)}
          icon={authController.isEnabled() ? <UserCircleIcon /> : null}
        >
          {authController.isEnabled() ? (
            <StyledDiv>
              <div>
                {authController.shouldAuthLocally() ? (
                  <StyledText>{authController.getLocalUserName()}</StyledText>
                ) : (
                  <KeycloakName />
                )}
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
          {authController.isEnabled() && (
            <DropdownItem onClick={() => authController.logout()}>
              {words("dashboard.logout")}
            </DropdownItem>
          )}
        </div>
      </DropdownList>
    </Dropdown>
  );
};

const StyledText = styled(TextContent)`
  font-weight: bold;
  text-align: start;
`;
const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
`;
