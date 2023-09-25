import React, { useContext } from "react";
import {
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Icon,
  MenuToggle,
  Tooltip,
} from "@patternfly/react-core";
import { UserCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Profile } from "../Actions/Profile";

interface Props {
  searchValue: string;
  onSearchInputChange: (value: string) => void;
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

  const envs = [
    <DropdownList label={words("home.environment.selector")} key="envs-group">
      {items.map((item, index) => (
        <StyledItem onClick={() => onSelect(item)} key={`env-${index}-${item}`}>
          {item.length > 28 ? item.slice(0, 20) + "..." : item}
        </StyledItem>
      ))}
    </DropdownList>,
  ];

  //add footer at the end
  envs.push(
    <div key="overview-link">
      <StyledSeparator />
      <Tooltip content={words("home.navigation.tooltip")}>
        <StyledItem href={routeManager.getUrl("Home", undefined)}>
          {words("home.navigation.button")}
        </StyledItem>
      </Tooltip>
      {keycloakController.isEnabled() && (
        <StyledItem onClick={() => keycloakController.getInstance().logout()}>
          {words("dashboard.logout")}
        </StyledItem>
      )}
    </div>,
  );

  return (
    <StyledDropdown
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(!open)}
      toggle={() => (
        <MenuToggle id="toggle-button">
          {keycloakController.isEnabled() ? (
            <StyledDiv>
              <StyledIcon size="lg">
                <UserCircleIcon />
              </StyledIcon>
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
      {envs}
    </StyledDropdown>
  );
};

const StyledDropdown = styled(Dropdown)`
  height: 100%;
  --pf-v5-c-dropdown--m-expanded__toggle--before--BorderBottomWidth: 4px;
  --pf-v5-c-dropdown__toggle--before--BorderRightColor: #666768;
  --pf-v5-c-dropdown__toggle--before--BorderLeftColor: #666768;
  --pf-v5-c-dropdown__toggle--PaddingRight: 1rem;
  --pf-v5-c-dropdown__toggle--PaddingLeft: 1rem;
`;
const StyledItem = styled(DropdownItem)`
  max-width: 260px;
  min-width: 260px;
`;
const StyledSeparator = styled(Divider)`
  padding: 0 15px;
  margin: 10px 0 5px !important;
`;

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  --pf-v5-c-icon__content--Color: white;
`;
