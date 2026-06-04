import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Brand,
  Content,
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
} from "@patternfly/react-core";
import { CheckIcon, PlusCircleIcon, SignOutAltIcon, UserCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import fallBackImage from "@images/inmanta-wings.svg";
import { DarkmodeOption } from "@/UI/Components/DarkmodeOption";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

interface Props {
  items: EnvironmentSelectorItem[];
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
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchText("");
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Only show the user management link if the auth method is database. Other auth methods have external user and role management.
  const authConfig = globalThis && globalThis.auth;
  const showUserManagement = !authHelper.isDisabled() && authConfig?.method === "database";
  const showLogout = !authHelper.isDisabled();

  const filteredItems = searchText
    ? items.filter((item) => item.displayName.toLowerCase().includes(searchText.toLowerCase()))
    : items;

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
          data-testid="env-selector-toggle"
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
      <StyledDropdownList>
        <DropdownGroup label={words("home.environment.selector")} key="envs-group">
          <SearchContainer onClick={(e) => e.stopPropagation()}>
            <SearchInput
              aria-label={words("home.environmentSwitcher.search.placeholder")}
              placeholder={words("home.environmentSwitcher.search.placeholder")}
              value={searchText}
              onChange={(_event, value) => setSearchText(value)}
              onClear={() => setSearchText("")}
            />
          </SearchContainer>
          {filteredItems.map((item, index) => (
            <DropdownItem
              onClick={() => onSelect(item.displayName)}
              key={`env-${index}-${item.environmentId}`}
              icon={<EnvironmentIcon icon={item.icon} />}
            >
              <EnvItemRow>
                <span>
                  {item.displayName.length > 28
                    ? item.displayName.slice(0, 20) + "..."
                    : item.displayName}
                </span>
                {item.displayName === toggleText && (
                  <CheckIcon color="var(--pf-t--global--color--brand--default)" />
                )}
              </EnvItemRow>
            </DropdownItem>
          ))}
        </DropdownGroup>
        <div>
          <Divider />
          <DropdownItem
            onClick={() => navigate(routeManager.getUrl("CreateEnvironment", undefined))}
            icon={<PlusCircleIcon />}
          >
            {words("home.environmentSwitcher.create.button")}
          </DropdownItem>
          {showUserManagement && (
            <DropdownItem
              onClick={() => navigate(routeManager.getUrl("UserManagement", undefined))}
            >
              {words("userManagement.title")}
            </DropdownItem>
          )}
          {showLogout && (
            <DropdownItem onClick={() => authHelper.logout()} icon={<SignOutAltIcon />}>
              {words("dashboard.logout")}
            </DropdownItem>
          )}
        </div>
        <DarkmodeOption />
      </StyledDropdownList>
    </Dropdown>
  );
};

const EnvironmentIcon: React.FC<{ icon?: string }> = ({ icon }) => (
  <EnvironmentBrand src={icon ?? fallBackImage} alt="" $hasCustomIcon={!!icon} />
);

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

const EnvItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const SearchContainer = styled.div`
  padding: var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md);
`;

const StyledDropdownList = styled(DropdownList)`
  min-width: 300px;
`;

/** Circular crop for custom icons; contain for the fallback SVG. */
const EnvironmentBrand = styled(Brand)<{ $hasCustomIcon: boolean }>`
  width: 20px;
  height: 20px;
  ${({ $hasCustomIcon }) =>
    $hasCustomIcon ? "border-radius: 50%; object-fit: cover;" : "object-fit: contain;"}
`;
