import React, { useContext } from "react";
import {
  BackgroundImage,
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
import lg from "@patternfly/react-core/dist/styles/assets/images/pfbg_2000.jpg";
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
      <BackgroundImage src={lg} alt="Background image" />
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
          <Toolbar id="uncontrolled-toolbar">
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
                <ToolbarItem>
                  <EnvSelectorWithProvider />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </MastheadContent>
      </Masthead>
    </>
  );
};
