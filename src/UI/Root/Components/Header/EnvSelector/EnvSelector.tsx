import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Avatar,
  Button,
  Content,
  Divider,
  Flex,
  FlexItem,
  Menu,
  MenuContainer,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  MenuToggleElement,
  ModalVariant,
  SearchInput,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import {
  CheckIcon,
  FolderOpenIcon,
  PlusCircleIcon,
  SignOutAltIcon,
  UserCircleIcon,
  UsersIcon,
} from "@patternfly/react-icons";
import { DarkmodeOption } from "@/UI/Components/DarkmodeOption";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider/ModalProvider";
import { words } from "@/UI/words";
import fallBackImage from "@images/inmanta-wings.svg";
import { ManageProjectsModal } from "./ManageProjectsModal";
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
  const { triggerModal, closeModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<MenuToggleElement>(null);
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

  const toggle = (
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
          <Content>{toggleText.length > 28 ? toggleText.slice(0, 20) + "..." : toggleText}</Content>
        </FlexItem>
      </Flex>
    </MenuToggle>
  );

  const menu = (
    <Menu
      ref={menuRef}
      style={{
        paddingBlockEnd: 0,
      }}
      onSelect={() => setIsOpen(false)}
    >
      <MenuContent>
        <MenuGroup label={words("home.environment.selector")} key="envs-group">
          <MenuSearch>
            <MenuSearchInput>
              <SearchInput
                aria-label={words("home.environmentSwitcher.search.placeholder")}
                placeholder={words("home.environmentSwitcher.search.placeholder")}
                value={searchText}
                onChange={(_event, value) => setSearchText(value)}
                onClear={() => setSearchText("")}
                onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                  event.stopPropagation();
                }}
              />
            </MenuSearchInput>
          </MenuSearch>
        </MenuGroup>
        <MenuList>
          {items.length === 0 ? (
            <MenuItem isDisabled key="no-env">
              {words("home.environmentSwitcher.noEnvironments")}
            </MenuItem>
          ) : (
            filteredItems.map((item, index) => (
              <MenuItem
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
              </MenuItem>
            ))
          )}
          <Divider />
          <MenuItem
            onClick={() => navigate(routeManager.getUrl("CreateEnvironment", undefined))}
            icon={<PlusCircleIcon />}
          >
            {words("home.environmentSwitcher.create.button")}
          </MenuItem>
          <MenuItem
            onClick={() =>
              triggerModal({
                title: words("home.manageProjects.title"),
                description: words("home.manageProjects.description"),
                content: <ManageProjectsModal />,
                variant: ModalVariant.medium,
                actions: (
                  <Button key="close" variant="secondary" onClick={closeModal}>
                    {words("home.manageProjects.close.button")}
                  </Button>
                ),
              })
            }
            icon={<FolderOpenIcon />}
            data-testid="manage-projects-menu-item"
          >
            {words("home.environmentSwitcher.manageProjects.button")}
          </MenuItem>
          {showUserManagement && (
            <MenuItem
              onClick={() => navigate(routeManager.getUrl("UserManagement", undefined))}
              icon={<UsersIcon />}
            >
              {words("userManagement.title")}
            </MenuItem>
          )}
          {showLogout && (
            <MenuItem onClick={() => authHelper.logout()} icon={<SignOutAltIcon />}>
              {words("dashboard.logout")}
            </MenuItem>
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
                  padding: "var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--lg)",
                  color: "var(--pf-t--global--text--color--subtle)",
                  backgroundColor: "var(--pf-t--global--background--color--secondary--default)",
                }}
              >
                <FlexItem>
                  <UserCircleIcon />
                </FlexItem>
                <FlexItem>
                  <span>
                    {words("home.environmentSwitcher.signedInAs")}
                    <strong>{authHelper.getUser()}</strong>
                  </span>
                </FlexItem>
              </Flex>
            </>
          )}
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <MenuContainer
      menu={menu}
      menuRef={menuRef}
      toggle={toggle}
      toggleRef={toggleRef}
      isOpen={isOpen}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      onOpenChangeKeys={["Escape"]}
      popperProps={{
        position: "end",
        minWidth: "300px",
      }}
    />
  );
};

const EnvironmentIcon: React.FC<{ icon?: string }> = ({ icon }) => (
  <Avatar
    src={icon ?? fallBackImage}
    alt="Environment icon"
    style={{ height: "20px", width: "20px", display: "block" }}
  />
);
