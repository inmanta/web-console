import React from "react";
import { Page } from "@patternfly/react-core";
import { BlockingModal } from "@/UI/Components/BlockingModal";
import { ExpertBanner } from "@/UI/Components/ExpertBanner";
import { LicenseBanner } from "@/UI/Components/LicenseBanner";
import { Header } from "@/UI/Root/Components/Header";
import { PageBreadcrumbs } from "@/UI/Root/Components/PageBreadcrumbs";
import { Sidebar } from "@/UI/Root/Components/Sidebar";
import { useDrawer } from "@S/Notification/UI/Drawer";

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

  return (
    <>
      <div role="alert" aria-label="bannerNotifications">
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
          breadcrumb={<PageBreadcrumbs />}
          masthead={<Header {...{ onNotificationsToggle }} noEnv={!Boolean(environmentId)} />}
          sidebar={<Sidebar environment={environmentId} />}
        >
          {children}
        </Page>
      </div>
    </>
  );
};
