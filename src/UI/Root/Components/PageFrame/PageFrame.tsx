import React from "react";
import { Page } from "@patternfly/react-core";
import { Header } from "@/UI/Root/Components/Header";
import { PageBreadcrumbs } from "@/UI/Root/Components/PageBreadcrumbs";
import { Sidebar } from "@/UI/Root/Components/Sidebar";
import { useDrawer } from "@S/Notification/UI/Drawer";

interface Props {
  environmentId?: string;
}

export const PageFrame: React.FC<Props> = ({ children, environmentId }) => {
  const {
    onNotificationsToggle,
    notificationDrawer,
    onNotificationDrawerExpand,
    isNotificationDrawerExpanded,
  } = useDrawer(Boolean(environmentId));

  return (
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
  );
};
