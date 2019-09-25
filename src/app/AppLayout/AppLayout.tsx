import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Nav,
  NavItem,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  NavGroup,
  Toolbar,
  Avatar,
  ToolbarGroup,
  TextContent,
  DropdownItem,
  DropdownSeparator
} from '@patternfly/react-core';
import { routes } from '@app/routes';
import Logo from '!react-svg-loader!@images/logo.svg';
import AvatarImg from '!url-loader!@assets/images/img_avatar.svg';
import { EnvironmentSelector } from './Toolbar/EnvironmentSelector';
import { SimpleNotificationBadge } from './Toolbar/SimpleNotificationBadge';
import { IconDropdown } from './Toolbar/IconDropdown';
import { useKeycloak } from 'react-keycloak';
import { AngleDownIcon, CogIcon } from '@patternfly/react-icons';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const logoProps = {
    href: '/'
  };
  const [isNavOpen, setIsNavOpen] = React.useState(true);
  const [isMobileView, setIsMobileView] = React.useState(true);
  const [isNavOpenMobile, setIsNavOpenMobile] = React.useState(false);
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  }
  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };

  const inmantaLogo = <Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />

  const Login = () => {
    const [keycloak, initialized] = useKeycloak();
    const [name, setName] = React.useState('');
    keycloak.loadUserProfile().success(userInfo => {
      setName(userInfo.firstName as string);
    });


    return (
      <TextContent>
        {name}

      </TextContent>
    );
  }

  const UpperToolbar = () => {
    const [keycloak, initialized] = useKeycloak();

    const dropdownItems = [
      <DropdownItem key="link">Link</DropdownItem>,
      <DropdownItem key="action" component="button">
        Action
      </DropdownItem>,
      <DropdownItem key="disabled link" isDisabled={true}>
        Disabled Link
      </DropdownItem>,
      <DropdownItem key="disabled action" isDisabled={true} component="button">
        Disabled Action
      </DropdownItem>,
      <DropdownSeparator key="separator" />,
      <DropdownItem key="separated link">Separated Link</DropdownItem>,
      <DropdownItem key="separated action" component="button">
        Separated Action
      </DropdownItem>
    ];
    const profileDropdownItems = [
      <DropdownItem key="action" component="button">
        Action
      </DropdownItem>,
      <DropdownSeparator key="separator" />,
      <DropdownItem key="action2" component="button" onClick={keycloak.logout}>
        Logout
    </DropdownItem>,
    ]
    return <Toolbar>
      <ToolbarGroup>
        <SimpleNotificationBadge />
        <IconDropdown icon={CogIcon} dropdownItems={dropdownItems} />
      </ToolbarGroup>
      <ToolbarGroup>
        <Login />
        <IconDropdown icon={AngleDownIcon} dropdownItems={profileDropdownItems} />
        <Avatar src={AvatarImg} alt="Avatar image" />
      </ToolbarGroup>
    </Toolbar>
  }

  const Header = (
    <PageHeader
      logo={inmantaLogo}
      logoProps={logoProps}
      toolbar={<UpperToolbar />}
      showNavToggle={true}
      topNav={<EnvironmentSelector />}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
    />
  );

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      {
        routes.map((routeItem, idx) => {
          return <NavGroup title={routeItem.name} key={`${routeItem.name}-${idx}`}>
            {
              routeItem.exactRoutes.map((route, index) => {
                return <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`}>
                  <NavLink exact={true} to={routeItem.pathPrefix + route.path} activeClassName="pf-m-current">{route.label}</NavLink>
                </NavItem>
              })
            }
          </NavGroup>
        }
        )
      }

    </Nav>
  );
  const Sidebar = (
    <PageSidebar
      nav={Navigation}
      isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen} theme="dark" />
  );
  const PageSkipToContent = (
    <SkipToContent href="#primary-app-container">
      Skip to Content
    </SkipToContent>
  );
  return (
    <Page
      mainContainerId="primary-app-container"
      header={Header}
      sidebar={Sidebar}
      onPageResize={onPageResize}
      skipToContent={PageSkipToContent}>
      {children}
    </Page>
  );
}

export { AppLayout };
