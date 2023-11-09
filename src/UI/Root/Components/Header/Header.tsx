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
} from "@patternfly/react-core";
import { BarsIcon } from "@patternfly/react-icons";
import { Badge } from "@/Slices/Notification/UI/Badge";
import { DependencyContext } from "@/UI/Dependency";
import logo from "@images/logo.svg";
import { DocumentationLink } from "./Actions/DocumentationLink";
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
          <PageToggleButton variant="plain" aria-label="Main Navigation">
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
                    <Badge onClick={onNotificationsToggle} />
                  </ToolbarItem>
                )}
                <StatusButton />
                <DocumentationLink />
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
