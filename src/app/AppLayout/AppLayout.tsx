import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Nav,
  NavItem,
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  NavGroup
} from '@patternfly/react-core';
import { routes } from '@app/routes';
import Logo from '!react-svg-loader!@images/logo.svg';

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

  const inmantaLogo = <Logo alt="Inmanta Logo" aria-label="Inmanta Logo"/>

  const Header = (
    <PageHeader
      logo={inmantaLogo}
      logoProps={logoProps}
      toolbar="Toolbar"
      showNavToggle={true}
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
      isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen} theme="dark"/>
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
