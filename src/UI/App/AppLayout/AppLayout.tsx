import * as React from "react";
import {
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  Avatar,
  TextContent,
  DropdownItem,
  PageHeaderTools,
  PageHeaderToolsGroup,
} from "@patternfly/react-core";
import Logo from "!react-svg-loader!@images/logo.svg";
import AvatarImg from "!url-loader!@assets/images/img_avatar.svg";
import { IconDropdown } from "./Toolbar/IconDropdown";
import { AngleDownIcon } from "@patternfly/react-icons";
import { useStoreState } from "@/UI/Store";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";
import { EnvSelectorWithProvider } from "./Toolbar/Provider";
import { PageBreadcrumbs, Navigation } from "@/UI/Routing";

interface IAppLayout {
  logoBaseUrl: string;
  keycloak?: Keycloak.KeycloakInstance;
  children: React.ReactNode;
  shouldUseAuth: boolean;
}

export const AppLayout: React.FunctionComponent<IAppLayout> = ({
  logoBaseUrl,
  keycloak,
  children,
  shouldUseAuth,
}) => {
  const logoProps = {
    href: logoBaseUrl,
  };
  React.useEffect(() => {
    if (keycloak && !keycloak.profile) {
      keycloak.loadUserProfile();
    }
  }, [keycloak?.authenticated]);

  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const inmantaLogo = <Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />;
  const selectedEnvironmentId = useStoreState(
    (state) => state.projects.selectedEnvironmentId
  );

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
              onClick={keycloak && keycloak.logout}
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
      logoProps={logoProps}
      headerTools={shouldUseAuth ? <Profile /> : undefined}
      showNavToggle={true}
      topNav={<EnvSelectorWithProvider />}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
      style={{ backgroundColor: "transparent" }}
    />
  );

  const Sidebar = (
    <PageSidebar
      aria-label="PageSidebar"
      nav={<Navigation environment={selectedEnvironmentId} />}
      isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
      theme="dark"
    />
  );
  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>
  );
  return (
    <React.Fragment>
      <SimpleBackgroundImage />
      <Page
        breadcrumb={<PageBreadcrumbs />}
        mainContainerId="primary-app-container"
        header={Header}
        sidebar={Sidebar}
        onPageResize={onPageResize}
        skipToContent={PageSkipToContent}
        style={{ backgroundColor: "transparent" }}
      >
        {children}
      </Page>
    </React.Fragment>
  );
};
