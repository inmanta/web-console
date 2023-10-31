import React from "react";
import { Page } from "@patternfly/react-core";
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
      <ExpertBanner />
      <LicenseBanner />
      <div className="pf-m-grow" style={{ minHeight: "0%" }}>
        <Page
          {...{
            notificationDrawer,
            onNotificationDrawerExpand,
            isNotificationDrawerExpanded,
          }}
          isManagedSidebar
          breadcrumb={<PageBreadcrumbs />}
          header={
            <Header
              {...{ onNotificationsToggle }}
              noEnv={!Boolean(environmentId)}
            />
          }
          sidebar={<Sidebar environment={environmentId} />}
        >
          {children}
        </Page>
      </div>
    </>
  );
};
