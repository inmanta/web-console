import React, { useContext } from "react";
import {
  Toolbar,
  Masthead,
  MastheadLogo,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  MastheadBrand,
  PageToggleButton,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  Brand,
} from "@patternfly/react-core";
import { BarsIcon } from "@patternfly/react-icons";
import { Badge } from "@/Slices/Notification/UI/Badge";
import { getThemePreference } from "@/UI/Components/DarkmodeOption";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import logo from "@images/logo.svg";
import logo_dark from "@images/logo_dark.svg";
import { DocumentationLinks } from "./Actions/DocumentationLinks";
import { StatusButton } from "./Actions/StatusButton";
import { EnvSelectorWithProvider } from "./EnvSelector";

/**
 * Properties for the Header component.
 *
 * @interface
 * @prop {boolean} noEnv - A flag indicating whether there is no environment selected.
 * @prop {function} onNotificationsToggle - A function to be called when the notifications badge is clicked.
 */
interface Props {
  noEnv: boolean;
  onNotificationsToggle(): void;
}

/**
 * Header component of the application.
 *
 * This component is responsible for rendering the header of the application.
 *
 * @component
 * @props {Props} props - The properties that define the behavior of the header.
 * @prop {boolean} props.noEnv - A flag indicating whether there is no environment selected.
 * @prop {function} props.onNotificationsToggle - A function to be called when the notifications badge is clicked.
 * @returns {React.FC<Props> } The rendered Header component.
 */
export const Header: React.FC<Props> = ({ noEnv, onNotificationsToggle }) => {
  const { routeManager, environmentHandler } = useContext(DependencyContext);
  const theme = getThemePreference();

  return (
    <>
      <Masthead id="page-header">
        <MastheadMain>
          <MastheadToggle>
            <PageToggleButton variant="plain" aria-label="Main Navigation">
              <BarsIcon />
            </PageToggleButton>
          </MastheadToggle>
          <MastheadBrand>
            <MastheadLogo
              href={
                noEnv
                  ? routeManager.getUrl("Home", undefined)
                  : routeManager.getUrl("Dashboard", undefined) +
                    `?env=${environmentHandler.useId()}`
              }
            >
              <Brand
                src={theme === "dark" ? logo_dark : logo}
                alt="Inmanta-logo"
              />
            </MastheadLogo>
          </MastheadBrand>
        </MastheadMain>
        <MastheadContent>
          <Toolbar id="uncontrolled-toolbar" isFullHeight isStatic>
            <ToolbarContent>
              <ToolbarGroup
                variant="action-group-plain"
                align={{ default: "alignEnd" }}
                gap={{ default: "gapNone", md: "gapMd" }}
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
