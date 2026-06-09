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
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { CheckIcon, PlusCircleIcon, SignOutAltIcon, UserCircleIcon, UsersIcon } from "@patternfly/react-icons";
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
      style={{ paddingBottom: 0 }}
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
          <Flex alignItems={{ default: "alignItemsCenter" }} style={{ gap: "20px" }}>
            <FlexItem>
              {authHelper.getUser() && (
                <Content style={{ fontWeight: "bold", textAlign: "start" }}>
                  {authHelper.getUser()}
                </Content>
              )}
              <div>{toggleText.length > 28 ? toggleText.slice(0, 20) + "..." : toggleText}</div>
            </FlexItem>
          </Flex>
        </MenuToggle>
      )}
    >
      <DropdownList style={{ minWidth: "300px" }}>
        <DropdownGroup label={words("home.environment.selector")} key="envs-group">
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ padding: "var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)" }}
          >
            <SearchInput
              aria-label={words("home.environmentSwitcher.search.placeholder")}
              placeholder={words("home.environmentSwitcher.search.placeholder")}
              value={searchText}
              onChange={(_event, value) => setSearchText(value)}
              onClear={() => setSearchText("")}
            />
          </div>
          {items.length === 0 ? (
            <DropdownItem isDisabled key="no-env">
              {words("home.environmentSwitcher.noEnvironments")}
            </DropdownItem>
          ) : (
            filteredItems.map((item, index) => (
              <DropdownItem
                onClick={() => onSelect(item.displayName)}
                key={`env-${index}-${item.environmentId}`}
                icon={<EnvironmentIcon icon={item.icon} />}
              >
                <Split>
                  <SplitItem isFilled>
                    <span>
                      {item.displayName.length > 28
                        ? item.displayName.slice(0, 20) + "..."
                        : item.displayName}
                    </span>
                  </SplitItem>
                  {item.displayName === toggleText && (
                    <SplitItem>
                      <CheckIcon color="var(--pf-t--global--color--brand--default)" />
                    </SplitItem>
                  )}
                </Split>
              </DropdownItem>
            ))
          )}
        </DropdownGroup>
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
            icon={<UsersIcon />}
          >
            {words("userManagement.title")}
          </DropdownItem>
        )}
        {showLogout && (
          <DropdownItem onClick={() => authHelper.logout()} icon={<SignOutAltIcon />}>
            {words("dashboard.logout")}
          </DropdownItem>
        )}
        <DarkmodeOption />
        {authHelper.getUser() && (
          <>
            <Divider />
            <Flex
              key="user-info"
              alignItems={{ default: "alignItemsCenter" }}
              spaceItems={{ default: "spaceItemsSm" }}
              style={{
                padding: "var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)",
                color: "var(--pf-t--global--text--color--subtle)",
                backgroundColor: "var(--pf-t--global--background--color--secondary--default)"
              }}
            >
              <FlexItem>
                <UserCircleIcon />
              </FlexItem>
              <FlexItem>
                <span>Signed in as: <strong>{authHelper.getUser()}</strong></span>
              </FlexItem>
            </Flex>
          </>
        )}
      </DropdownList>
    </Dropdown>
  );
};

const EnvironmentIcon: React.FC<{ icon?: string }> = ({ icon }) => (
  <Brand
    src={icon ?? fallBackImage}
    alt=""
    style={{
      width: "20px",
      height: "20px",
      ...(icon
        ? { borderRadius: "50%", objectFit: "cover" as const }
        : { objectFit: "contain" as const }),
    }}
  />
);
