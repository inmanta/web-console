import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Content,
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
import { DarkmodeOption } from "@/UI/Components/DarkmodeOption";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

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
  const { routeManager, authHelper } = useContext(DependencyContext);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      popperProps={{
        position: "end",
      }}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      onClick={handleToggle}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          id="toggle-button"
          ref={toggleRef}
          isExpanded={isOpen}
          aria-label={toggleText}
          isFullHeight
          onClick={handleToggle}
          icon={authHelper.getUser() ? <UserCircleIcon /> : null}
        >
          <StyledDiv>
            <div>
              {authHelper.getUser() && <StyledText>{authHelper.getUser()}</StyledText>}
              <div>{toggleText.length > 28 ? toggleText.slice(0, 20) + "..." : toggleText}</div>
            </div>
          </StyledDiv>
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownGroup label={words("home.environment.selector")} key="envs-group">
          {items.map((item, index) => (
            <DropdownItem onClick={() => onSelect(item)} key={`env-${index}-${item}`}>
              {item.length > 28 ? item.slice(0, 20) + "..." : item}
            </DropdownItem>
          ))}
        </DropdownGroup>
        <div key="overview-link">
          <Divider />
          <Tooltip content={words("home.navigation.tooltip")} entryDelay={500}>
            <DropdownItem onClick={() => navigate(routeManager.getUrl("Home", undefined))}>
              {words("home.navigation.button")}
            </DropdownItem>
          </Tooltip>
          {!authHelper.isDisabled() && (
            <>
              <DropdownItem
                onClick={() => navigate(routeManager.getUrl("UserManagement", undefined))}
              >
                {words("userManagement.title")}
              </DropdownItem>
              <DropdownItem onClick={() => authHelper.logout()}>
                {words("dashboard.logout")}
              </DropdownItem>
            </>
          )}
        </div>
        <DarkmodeOption />
      </DropdownList>
    </Dropdown>
  );
};

const StyledText = styled(Content)`
  font-weight: bold;
  text-align: start;
`;
const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
`;
