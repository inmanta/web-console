import React, { useState } from "react";
import { Page } from "@patternfly/react-core";
import { createGlobalStyle } from "styled-components";
import { EnvSelectorOpenContext } from "@inmanta/web-console-core/Dependency/EnvSelectorOpenContext";
import { BlockingModal } from "@inmanta/web-console-shell/Components/BlockingModal";
import { ExpertBanner } from "@inmanta/web-console-shell/Components/ExpertBanner";
import { Header } from "@inmanta/web-console-shell/Components/Header";
import { LicenseBanner } from "@inmanta/web-console-shell/Components/LicenseBanner";
import { PageBreadcrumbs } from "@inmanta/web-console-shell/Components/PageBreadcrumbs";
import { Sidebar } from "@inmanta/web-console-shell/Components/Sidebar";
import { useDrawer } from "@inmanta/web-console-shell/Slices/Notification/UI/Drawer";

/**
 * A page that puts the document in full screen, like the Instance Composer, gets the whole screen:
 * the banners, the masthead and the sidebar step aside until it leaves full screen.
 */
const FullscreenFrame = createGlobalStyle`
  :root:fullscreen {
    .page-banners,
    #page-header,
    .pf-v6-c-page__sidebar {
      display: none;
    }
  }
`;

interface Props {
  environmentId?: string;
}

export const PageFrame: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  environmentId,
}) => {
  const {
    onNotificationsToggle,
    notificationDrawer,
    onNotificationDrawerExpand,
    isNotificationDrawerExpanded,
  } = useDrawer(Boolean(environmentId));
  const [isEnvSelectorOpen, setIsEnvSelectorOpen] = useState(false);

  return (
    <EnvSelectorOpenContext.Provider
      value={{ isOpen: isEnvSelectorOpen, setIsOpen: setIsEnvSelectorOpen }}
    >
      <FullscreenFrame />
      <div className="page-banners" role="alert" aria-label="bannerNotifications">
        {environmentId && <ExpertBanner />}
        <LicenseBanner />
      </div>
      <div className="pf-m-grow" style={{ minHeight: "0%" }}>
        <BlockingModal />
        <Page
          {...{
            notificationDrawer,
            onNotificationDrawerExpand,
            isNotificationDrawerExpanded,
          }}
          isManagedSidebar
          mainContainerId="primary-app-container"
          breadcrumb={<PageBreadcrumbs />}
          masthead={<Header {...{ onNotificationsToggle }} noEnv={!Boolean(environmentId)} />}
          sidebar={<Sidebar environment={environmentId} />}
        >
          {children}
        </Page>
      </div>
    </EnvSelectorOpenContext.Provider>
  );
};
