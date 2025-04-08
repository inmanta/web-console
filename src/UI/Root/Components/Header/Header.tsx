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
} from "@patternfly/react-core";
import { BarsIcon } from "@patternfly/react-icons";
import { Badge } from "@/Slices/Notification/UI/Badge";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
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
              aria-label="Inmanta-logo"
              href={
                noEnv
                  ? routeManager.getUrl("Home", undefined)
                  : routeManager.getUrl("Dashboard", undefined) +
                    `?env=${environmentHandler.useId()}`
              }
            >
              <LogoImage />
            </MastheadLogo>
          </MastheadBrand>
        </MastheadMain>
        <MastheadContent>
          <Toolbar id="uncontrolled-toolbar" isStatic>
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

/**
 * We keep the svg locally to have it within the scope of the css variables.
 * When being computed to a data:url, it loses the scope of the css variables.
 * @returns {React.FC} The rendered LogoImage component.
 */
const LogoImage: React.FC = () => (
  <svg width="285" height="50" viewBox="0 0 285 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask
      id="mask0_1495_21356"
      style={{ maskType: "luminance" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="-1"
      width="285"
      height="52"
    >
      <path d="M284.736 -0.00195312H0V50.0027H284.736V-0.00195312Z" fill="white" />
    </mask>
    <g mask="url(#mask0_1495_21356)">
      <path
        d="M96.9419 19.998H92.7578V45.3642H96.9419V19.998ZM125.221 45.3642H129.352V30.485C129.352 27.0593 128.513 24.3597 126.836 22.3814C125.159 20.4031 122.82 19.4139 119.82 19.4139C115.794 19.4139 112.952 21.2518 111.294 24.9212L110.816 20.0497H107.216V45.3626H111.398V32.9167C111.469 29.8476 112.158 27.4449 113.464 25.7167C114.771 23.9869 116.483 23.1236 118.602 23.1236C120.72 23.1236 122.352 23.7416 123.501 24.9745C124.648 26.2105 125.221 28.0484 125.221 30.485V45.3642ZM173.68 45.3642H177.81V30.485C177.81 27.0593 176.979 24.3597 175.321 22.3814C173.663 20.4031 171.316 19.4139 168.277 19.4139C163.969 19.4139 161.022 21.4471 159.434 25.5037C158.763 23.598 157.687 22.107 156.204 21.0291C154.721 19.9529 152.885 19.4139 150.697 19.4139C146.672 19.4139 143.829 21.2518 142.17 24.9212L141.693 20.0497H138.093V45.3626H142.275V32.9167C142.346 29.8476 143.035 27.4449 144.341 25.7167C145.648 23.9869 147.36 23.1236 149.478 23.1236C151.597 23.1236 153.228 23.7416 154.377 24.9745C155.525 26.2105 156.099 28.0484 156.099 30.485V45.3642H160.228V33.0797C160.228 29.9719 160.821 27.5353 162.003 25.7716C163.186 24.0063 164.856 23.1236 167.009 23.1236C169.161 23.1236 170.812 23.7416 171.959 24.9745C173.107 26.2105 173.681 28.0484 173.681 30.485L173.68 45.3642ZM202.278 34.8289C202.278 37.1573 201.544 39.055 200.078 40.5201C198.613 41.9853 196.858 42.7163 194.808 42.7163C191.207 42.7163 189.406 41.1285 189.406 37.9512C189.406 36.5054 189.988 35.4453 191.153 34.774C192.318 34.1027 193.837 33.7655 195.709 33.7655C197.579 33.7671 199.77 34.1205 202.278 34.8289ZM202.807 45.3642H206.407V29.0553C206.407 25.8071 205.524 23.3883 203.759 21.7988C201.992 20.2094 199.539 19.4139 196.398 19.4139C194.915 19.4139 193.538 19.5575 192.267 19.8399C188.1 20.7564 186.017 23.1591 186.017 27.0399H190.623C190.623 25.4892 191.179 24.35 192.291 23.6239C193.403 22.901 194.868 22.5395 196.687 22.5395C198.505 22.5395 199.891 23.0333 200.843 24.0208C201.797 25.01 202.276 26.651 202.276 28.9456V32.1761C199.802 31.2595 197.208 30.798 194.489 30.798C191.77 30.798 189.503 31.4354 187.684 32.7053C185.864 33.9785 184.956 35.7438 184.956 38.0029C184.956 40.2619 185.778 42.1499 187.42 43.6699C189.061 45.19 191.241 45.9451 193.96 45.9451C198.021 45.9451 200.827 44.3412 202.381 41.1269L202.807 45.3642ZM233.151 45.3642H237.284V30.485C237.284 27.0593 236.443 24.3597 234.767 22.3814C233.09 20.4031 230.75 19.4139 227.749 19.4139C223.724 19.4139 220.881 21.2518 219.222 24.9212L218.746 20.0497H215.146V45.3626H219.331V32.9167C219.4 29.8476 220.089 27.4449 221.396 25.7167C222.701 23.9869 224.412 23.1236 226.532 23.1236C228.653 23.1236 230.284 23.7416 231.431 24.9745C232.578 26.2105 233.151 28.0484 233.151 30.485V45.3642ZM259.315 44.6236L258.732 41.6577C257.107 42.2951 255.642 42.6098 254.337 42.6098C251.934 42.6098 250.735 41.3237 250.735 38.7451V23.2269H258.679V20.0513H250.735V13.0078H246.604V20.0513H242.526V23.2285H246.604V38.8C246.604 40.036 246.796 41.0946 247.185 41.9772C247.926 43.7764 249.197 44.9624 250.998 45.5256C253.506 46.3389 256.276 46.0355 259.315 44.6236ZM280.602 34.8289C280.602 37.1573 279.869 39.055 278.405 40.5201C276.94 41.9853 275.183 42.7163 273.134 42.7163C269.535 42.7163 267.733 41.1285 267.733 37.9512C267.733 36.5054 268.314 35.4453 269.48 34.774C270.645 34.1027 272.162 33.7655 274.034 33.7655C275.906 33.7671 278.096 34.1205 280.602 34.8289ZM284.734 45.3642V29.0553C284.734 25.8071 283.851 23.3883 282.084 21.7988C280.319 20.2094 277.866 19.4139 274.723 19.4139C273.24 19.4139 271.864 19.5575 270.591 19.8399C266.424 20.7564 264.341 23.1591 264.341 27.0399H268.95C268.95 25.4892 269.505 24.35 270.616 23.6239C271.728 22.901 273.193 22.5395 275.012 22.5395C276.831 22.5395 278.217 23.0333 279.17 24.0208C280.124 25.01 280.6 26.651 280.6 28.9456V32.1761C278.128 31.2595 275.533 30.798 272.814 30.798C270.095 30.798 267.828 31.4354 266.01 32.7053C264.191 33.9785 263.284 35.7438 263.284 38.0029C263.284 40.2619 264.105 42.1499 265.745 43.6699C267.388 45.1883 269.566 45.9451 272.287 45.9451C276.346 45.9451 279.154 44.3412 280.708 41.1269L281.131 45.3626L284.734 45.3642Z"
        fill="var(--pf-t--global--text--color--regular)"
      />
    </g>
    <mask
      id="mask1_1495_21356"
      style={{ maskType: "luminance" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="-1"
      width="285"
      height="52"
    >
      <path d="M284.736 -0.00195312H0V50.0027H284.736V-0.00195312Z" fill="white" />
    </mask>
    <g mask="url(#mask1_1495_21356)">
      <path
        d="M55.9141 0C55.9141 0 49.6597 17.1448 44.0394 24.4384C38.4208 31.7319 20.0352 43.9503 20.0352 43.9503C20.0352 43.9503 44.3283 47.9473 55.0169 47.2841C65.7072 46.6192 79.5247 42.5852 79.5247 42.5852C79.5247 42.5852 71.1645 21.9276 67.1514 14.9325C63.1383 7.93904 55.9141 0 55.9141 0Z"
        fill="#009AA5"
      />
    </g>
    <mask
      id="mask2_1495_21356"
      style={{ maskType: "luminance" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="-1"
      width="285"
      height="52"
    >
      <path d="M284.736 -0.00195312H0V50.0027H284.736V-0.00195312Z" fill="white" />
    </mask>
    <g mask="url(#mask2_1495_21356)">
      <path
        d="M25.2005 13.5703C25.2005 13.5703 56.9292 35.6899 65.7428 38.4573C74.5548 41.2214 79.5684 42.551 79.5684 42.551C79.5684 42.551 63.3756 48.7312 45.0126 47.2063C26.6495 45.6847 19.7109 44.1146 19.7109 44.1146C19.7109 44.1146 24.363 39.7627 25.165 34.9315C25.967 30.1003 25.2005 13.5703 25.2005 13.5703Z"
        fill="#40A3AD"
      />
    </g>
    <mask
      id="mask3_1495_21356"
      style={{ maskType: "luminance" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="-1"
      width="285"
      height="52"
    >
      <path d="M284.736 -0.00195312H0V50.0027H284.736V-0.00195312Z" fill="white" />
    </mask>
    <g mask="url(#mask3_1495_21356)">
      <path
        d="M19.9383 44.0957C19.9383 44.0957 4.96705 48.2685 1.13631 49.6901C-2.69444 51.1149 3.89238 47.2729 10.0129 45.3785C16.1333 43.4809 23.7948 41.3848 23.7948 41.3848L19.9383 44.0957Z"
        fill="#009AA5"
      />
    </g>
    <mask
      id="mask4_1495_21356"
      style={{ maskType: "luminance" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="-1"
      width="285"
      height="52"
    >
      <path d="M284.736 -0.00195312H0V50.0027H284.736V-0.00195312Z" fill="white" />
    </mask>
    <g mask="url(#mask4_1495_21356)">
      <path
        d="M43.0751 25.569C33.645 19.4453 25.1428 13.5039 25.1428 13.5039C25.1428 13.5039 25.9141 30.1081 25.1122 34.9603C24.3102 39.8173 19.6484 44.1886 19.6484 44.1886C19.6484 44.1886 36.5818 32.9578 43.0751 25.569Z"
        fill="#A6CBD1"
      />
    </g>
    <mask
      id="mask5_1495_21356"
      style={{ maskType: "luminance" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="-1"
      width="285"
      height="52"
    >
      <path d="M284.736 -0.00195312H0V50.0027H284.736V-0.00195312Z" fill="white" />
    </mask>
    <g mask="url(#mask5_1495_21356)">
      <path
        d="M23.6704 41.4395C23.4332 41.5024 22.6748 41.7138 21.5888 42.0155C20.5609 43.3112 19.7025 44.1277 19.625 44.202C19.6282 44.1987 19.6347 44.1988 19.6379 44.1955C19.8235 44.0745 21.3855 43.0369 23.6704 41.4395Z"
        fill="#65AEB8"
      />
    </g>
  </svg>
);
