import React, { useContext } from "react";
import {
  Toolbar,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import { BarsIcon } from "@patternfly/react-icons";
import { Badge } from "@/Slices/Notification/UI/Badge";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import logo from "@images/logo.svg";
import { DocumentationLinks } from "./Actions/DocumentationLinks";
import { StatusButton } from "./Actions/StatusButton";
import { EnvSelectorWithProvider } from "./EnvSelector";

interface Props {
  noEnv: boolean;
  onNotificationsToggle(): void;
}

export const Header: React.FC<Props> = ({ noEnv, onNotificationsToggle }) => {
  const { routeManager, environmentHandler } = useContext(DependencyContext);
  return (
    <>
      <Masthead>
        <MastheadToggle>
          <PageToggleButton
            variant="plain"
            aria-label="Main Navigation"
            id="uncontrolled-nav-toggle"
          >
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadMain>
          <MastheadBrand
            href={
              noEnv
                ? routeManager.getUrl("Home", undefined)
                : routeManager.getUrl("Dashboard", undefined) +
                  `?env=${environmentHandler.useId()}`
            }
          >
            <img src={logo} alt="Inmanta Logo" aria-label="Inmanta Logo" />
          </MastheadBrand>
        </MastheadMain>
        <MastheadContent>
          <Toolbar id="uncontrolled-toolbar" isFullHeight isStatic>
            <ToolbarContent>
              <ToolbarGroup
                variant="icon-button-group"
                align={{ default: "alignRight" }}
                spacer={{ default: "spacerNone", md: "spacerMd" }}
              >
                {!noEnv && (
                  <ToolbarItem>
                    <Tooltip
                      content={words("dashboard.notifications.tooltip")}
                      position="bottom"
                      entryDelay={500}
                    >
                      <Badge onClick={onNotificationsToggle} />
                    </Tooltip>
                  </ToolbarItem>
                )}
                <StatusButton />
                <DocumentationLinks />
              </ToolbarGroup>
              <ToolbarItem>
                <EnvSelectorWithProvider />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </MastheadContent>
      </Masthead>
    </>
  );
};
