import * as React from "react";
import {
  PageHeader,
  Avatar,
  TextContent,
  DropdownItem,
  PageHeaderTools,
  PageHeaderToolsGroup,
} from "@patternfly/react-core";
import Logo from "!react-svg-loader!@images/logo.svg";
import AvatarImg from "!url-loader!@assets/images/img_avatar.svg";
import { AngleDownIcon } from "@patternfly/react-icons";
import { GlobalStyles } from "@/UI/Styles";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";
import { IconDropdown } from "./Toolbar/IconDropdown";
import { EnvSelectorWithProvider } from "./Toolbar/Provider";
import { Route } from "@/UI/Routing";
import styled from "styled-components";

interface Props {
  keycloak?: Keycloak.KeycloakInstance;
  children: React.ReactNode;
  shouldUseAuth: boolean;
  isNavOpen: boolean;
  setIsNavOpen: (navOpen: boolean) => void;
  isMobileView: boolean;
  isNavOpenMobile: boolean;
  setIsNavOpenMobile: (navOpenMobile: boolean) => void;
}

export const AppWrapper: React.FunctionComponent<Props> = ({
  keycloak,
  children,
  shouldUseAuth,
  isNavOpen,
  setIsNavOpen,
  isMobileView,
  isNavOpenMobile,
  setIsNavOpenMobile,
}) => {
  React.useEffect(() => {
    if (keycloak && !keycloak.profile) {
      keycloak.loadUserProfile();
    }
  }, [keycloak?.authenticated]);

  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const inmantaLogo = <Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />;
  const Login = () => {
    const [name, setName] = React.useState("inmanta2");
    if (keycloak && keycloak.profile && keycloak.profile.username !== name) {
      setName(keycloak.profile.username as string);
    }

    return <TextContent>{name}</TextContent>;
  };

  const Profile = () => (
    <PageHeaderTools>
      <PageHeaderToolsGroup>
        <Login />
        <IconDropdown
          icon={AngleDownIcon}
          dropdownItems={[
            <DropdownItem
              key="action2"
              component="button"
              onClick={keycloak && (() => keycloak.logout())}
            >
              Logout
            </DropdownItem>,
          ]}
        />
        <Avatar src={AvatarImg} alt="Avatar image" />
      </PageHeaderToolsGroup>
    </PageHeaderTools>
  );

  const Header = (
    <PageHeader
      logo={inmantaLogo}
      logoProps={{ href: Route.Catalog.path }}
      headerTools={shouldUseAuth ? <Profile /> : undefined}
      showNavToggle={true}
      topNav={<EnvSelectorWithProvider />}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
      style={{ backgroundColor: "transparent" }}
    />
  );

  return (
    <React.Fragment>
      <GlobalStyles />
      <SimpleBackgroundImage />
      <PageWrapper className="pf-c-page">
        {Header}
        {children}
      </PageWrapper>
    </React.Fragment>
  );
};

const PageWrapper = styled.div`
  grid-template-areas:
    "header header"
    "mainpage mainpage";
  background-color: transparent;
`;
