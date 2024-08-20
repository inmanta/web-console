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
import styled from "styled-components";
import { Badge } from "@/Slices/Notification/UI/Badge";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import logo from "@images/logo.svg";
import { DocumentationLinks } from "./Actions/DocumentationLinks";
import { StatusButton } from "./Actions/StatusButton";
import { EnvSelectorWithProvider } from "./EnvSelector";

/**
 * Properties for the Header component.
 *
 * @interface
 * @property {boolean} noEnv - A flag indicating whether there is no environment selected.
 * @property {function} onNotificationsToggle - A function to be called when the notifications badge is clicked.
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
 * @param {Props} props - The properties that define the behavior of the header.
 * @param {boolean} props.noEnv - A flag indicating whether there is no environment selected.
 * @param {function} props.onNotificationsToggle - A function to be called when the notifications badge is clicked.
 * @returns {ReactElement} The rendered Header component.
 */
export const Header: React.FC<Props> = ({ noEnv, onNotificationsToggle }) => {
  const { routeManager, environmentHandler } = useContext(DependencyContext);

  return (
    <>
      <Masthead id="page-header">
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
                  <StyledToolbarItem>
                    <Tooltip
                      content={words("dashboard.notifications.tooltip")}
                      position="bottom"
                      entryDelay={500}
                    >
                      <Badge onClick={onNotificationsToggle} />
                    </Tooltip>
                  </StyledToolbarItem>
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

/**
 * A styled ToolbarItem component.
 */
const StyledToolbarItem = styled(ToolbarItem)`
  padding-left: 8px;
  padding-right: 8px;
  &:hover {
    background-color: var(--pf-v5-global--primary-color--200);
  }
`;
