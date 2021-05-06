import * as React from "react";
import {
  Page,
  PageHeader,
  PageSidebar,
  SkipToContent,
  Avatar,
  TextContent,
  DropdownItem,
  AlertGroup,
  AlertVariant,
  Alert,
  AlertActionCloseButton,
  PageHeaderTools,
  PageHeaderToolsGroup,
} from "@patternfly/react-core";
import Logo from "!react-svg-loader!@images/logo.svg";
import AvatarImg from "!url-loader!@assets/images/img_avatar.svg";
import {
  EnvironmentSelector,
  IEnvironmentSelectorItem,
} from "./Toolbar/EnvironmentSelector";
import { IconDropdown } from "./Toolbar/IconDropdown";
import { AngleDownIcon } from "@patternfly/react-icons";
import { useStoreState, useStoreDispatch } from "@/UI/Store";
import * as _ from "lodash";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";
import { PageBreadcrumb } from "./PageBreadcrumb";
import { fetchInmantaApi } from "@/UI/App/utils/fetchInmantaApi";
import { ProjectModel } from "@/Core";
import { Navigation } from "../Navigation";

interface IAppLayout {
  logoBaseUrl: string;
  keycloak?: Keycloak.KeycloakInstance;
  children: React.ReactNode;
  setErrorMessage: React.Dispatch<string>;
  shouldUseAuth: boolean;
}

export const getEnvironmentNamesWithSeparator = (
  project: ProjectModel
): IEnvironmentSelectorItem[] => {
  if (project.environments) {
    return project.environments.map((environment) => {
      const envSelectorItem: IEnvironmentSelectorItem = {
        displayName: project.name + " / " + environment.name,
        projectId: project.id,
        environmentId: environment.id,
      };
      return envSelectorItem;
    });
  }
  return [{ displayName: project.name, projectId: project.id }];
};

export const AppLayout: React.FunctionComponent<IAppLayout> = ({
  logoBaseUrl,
  keycloak,
  children,
  setErrorMessage,
  shouldUseAuth,
}) => {
  const logoProps = {
    href: logoBaseUrl,
  };
  const projectsEndpoint = "/api/v2/project";
  const storeDispatch = useStoreDispatch();
  const [envAlert, setEnvAlert] = React.useState("");
  const ToastAlertGroup = () => {
    const variant = "warning";
    return (
      <AlertGroup isToast={true}>
        <Alert
          isLiveRegion={true}
          variant={AlertVariant[variant]}
          title={envAlert}
          id="env-warning-alert"
          actionClose={
            <AlertActionCloseButton
              title="Close environment warning"
              id="close-env-warning-button"
              variantLabel={`${variant} alert`}
              onClose={() => setEnvAlert("")}
            />
          }
        />
      </AlertGroup>
    );
  };
  const dispatch = (data) => {
    const searchParams = new URLSearchParams(window.location.search);
    const envFromUrl = searchParams.get("env");
    if (
      envFromUrl &&
      !data.find((project) =>
        project.environments.find((env) => env.id === envFromUrl)
      )
    ) {
      setEnvAlert(
        `Environment with id ${envFromUrl} not found, another was selected by default`
      );
    }
    storeDispatch.fetched(data);
  };
  const requestParams = {
    urlEndpoint: projectsEndpoint,
    dispatch,
    isEnvironmentIdRequired: false,
    environmentId: undefined,
    setErrorMessage,
    keycloak,
  };
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

  const projects: ProjectModel[] = useStoreState(
    (state) => state.projects.getAllProjects
  );
  const environments = _.flatMap(projects, (project) =>
    getEnvironmentNamesWithSeparator(project)
  );
  const inmantaLogo = <Logo alt="Inmanta Logo" aria-label="Inmanta Logo" />;
  const selectedEnvironmentId = useStoreState(
    (state) => state.environments.selectedEnvironmentId
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
      topNav={<EnvironmentSelector items={environments} />}
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
      {envAlert && <ToastAlertGroup />}
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
