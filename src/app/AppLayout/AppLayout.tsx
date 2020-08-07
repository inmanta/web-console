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
  AlertGroup,
  AlertVariant,
  Alert,
  AlertActionCloseButton
} from '@patternfly/react-core';
import { routes } from '@app/routes';
import Logo from '!react-svg-loader!@images/logo.svg';
import AvatarImg from '!url-loader!@assets/images/img_avatar.svg';
import { EnvironmentSelector, IEnvironmentSelectorItem } from './Toolbar/EnvironmentSelector';
import { SimpleNotificationBadge } from './Toolbar/SimpleNotificationBadge';
import { IconDropdown } from './Toolbar/IconDropdown';
import { AngleDownIcon, CogIcon } from '@patternfly/react-icons';
import { useStoreState, State, useStoreDispatch } from 'easy-peasy';
import { IStoreModel, IProjectModel } from '@app/Models/CoreModels';
import * as _ from 'lodash';
import SimpleBackgroundImage from './SimpleBackgroundImage';
import { PageBreadcrumb } from './PageBreadcrumb';
import { fetchInmantaApi } from '@app/utils/fetchInmantaApi';


interface IAppLayout {
  keycloak?: Keycloak.KeycloakInstance;
  children: React.ReactNode;
  setErrorMessage: React.Dispatch<string>;
  shouldUseAuth: boolean;
}
export const getEnvironmentNamesWithSeparator = (project: IProjectModel) => {
  if (project.environments) {
    return project.environments.map(environment => {
      const envSelectorItem: IEnvironmentSelectorItem = { displayName: project.name + ' / ' + environment.name, projectId: project.id, environmentId: environment.id };
      return envSelectorItem;
    });
  }
  return [{ displayName: project.name, projectId: project.id }];
};

const AppLayout: React.FunctionComponent<IAppLayout> = ({ keycloak, children, setErrorMessage, shouldUseAuth }) => {
  const logoProps = {
    href: '/'
  };
  const projectsEndpoint = '/api/v2/project';
  const storeDispatch = useStoreDispatch<IStoreModel>();
  const [envAlert, setEnvAlert] = React.useState('');
  const ToastAlertGroup = () => {
    const variant = "warning";
    return <AlertGroup isToast={true}>
            <Alert
              isLiveRegion={true}
              variant={AlertVariant[variant]}
              title={envAlert}
              action={
                <AlertActionCloseButton
                  title={envAlert}
                  variantLabel={`${variant} alert`}
                  onClose={() => setEnvAlert('')}
                />
              } />
        </AlertGroup>
  }
  const dispatch = (data) => {
    const searchParams = new URLSearchParams(window.location.search);
    const envFromUrl = searchParams.get("env");
    if (envFromUrl && !data.find(project => (project.environments.find(env => env.id === envFromUrl)))) {
      setEnvAlert(`Environment with id ${envFromUrl} not found, another was selected by default`);
    }
    storeDispatch.projects.fetched(data);
  };
  const requestParams = { urlEndpoint: projectsEndpoint, dispatch, isEnvironmentIdRequired: false, environmentId: undefined, setErrorMessage, keycloak };
  React.useEffect(() => {
    fetchInmantaApi(requestParams);
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

  const projects: IProjectModel[] = useStoreState((state: State<IStoreModel>) => state.projects.projects.getAllProjects);
  const environments = _.flatMap(projects, project => getEnvironmentNamesWithSeparator(project));
  const inmantaLogo = <Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />;
  const selectedEnvironmentId = useStoreState((state: State<IStoreModel>) => state.projects.environments.selectedEnvironmentId);

  const Login = () => {
    const [name, setName] = React.useState('inmanta2');
    if (keycloak && keycloak.profile && keycloak.profile.username !== name) {
      setName(keycloak.profile.username as string);
    }

    return <TextContent>{name}</TextContent>;
  };

  const ProfileDropdownGroup = () => {
    let profileDropdownItems;
    if (shouldUseAuth) {
      profileDropdownItems = [(
        <DropdownItem key="action2" component="button" onClick={keycloak && keycloak.logout}>
          Logout
        </DropdownItem>
      )];
    } else {
      profileDropdownItems = [(
        <DropdownItem key="action2" component="button" isDisabled={true}>
          Logout
        </DropdownItem>
      )];
    }
    return (
      <ToolbarGroup>
        {shouldUseAuth ? <Login /> : <TextContent> inmanta </TextContent>}
        <IconDropdown icon={AngleDownIcon} dropdownItems={profileDropdownItems} />
        <Avatar src={AvatarImg} alt="Avatar image" />
      </ToolbarGroup>
    );
  };

  const UpperToolbar = () => {
    const dropdownItems = [];
    return (
      <Toolbar>
        <ToolbarGroup>
          <SimpleNotificationBadge />
          <IconDropdown icon={CogIcon} dropdownItems={dropdownItems} />
        </ToolbarGroup>
        <ProfileDropdownGroup />
      </Toolbar>
    );
  };

  const Header = (
    <PageHeader
      logo={inmantaLogo}
      logoProps={logoProps}
      toolbar={<UpperToolbar />}
      showNavToggle={true}
      topNav={<EnvironmentSelector items={environments} />}
      isNavOpen={isNavOpen}
      onNavToggle={isMobileView ? onNavToggleMobile : onNavToggle}
    />
  );

  const Navigation = (
    <Nav id="nav-primary-simple" theme="dark">
      {routes.map((routeItem, idx) => {
        return (
          <NavGroup title={routeItem.name} key={`${routeItem.name}-${idx}`}>
            {routeItem.exactRoutes.map((route, index) => {
              return (!route.hideOnSideBar ?
                <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`}>
                  <NavLink exact={true} to={{pathname: routeItem.pathPrefix + route.path, search: location.search}} activeClassName="pf-m-current">
                    {route.label}
                  </NavLink>
                </NavItem> : null
              );
            })}
          </NavGroup>
        );
      })}
      <NavGroup title="Other sites" key="external">
        <li className="pf-c-nav__item">
          <a className="pf-c-nav__link" href={`/dashboard/#!/environment/${selectedEnvironmentId}`} target="_blank">Dashboard</a>
        </li>
      </NavGroup>
    </Nav>
  );
  const Sidebar = <PageSidebar nav={Navigation} isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen} theme="dark" />;
  const PageSkipToContent = <SkipToContent href="#primary-app-container">Skip to Content</SkipToContent>;
  return (
    <React.Fragment>
      <SimpleBackgroundImage />
      {envAlert && <ToastAlertGroup/>}
      <Page
        breadcrumb={<PageBreadcrumb />}
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

export { AppLayout };
