import React, { useState } from "react";
import { Page } from "@patternfly/react-core";
import { Header } from "@/UI/Root/Components/Header";
import { PageBreadcrumbs } from "@/UI/Root/Components/PageBreadcrumbs";
import { Sidebar } from "@/UI/Root/Components/Sidebar";
import { useDrawer } from "@S/Notification/UI/Drawer";

interface Props {
  environmentId?: string;
}

export const PageFrame: React.FC<Props> = ({ children, environmentId }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);

  const onPageResize = (props: { mobileView: boolean; windowSize: number }) => {
    setIsMobileView(props.mobileView);
  };
  const onNavToggleMobile = () => {
    setIsNavOpenMobile(!isNavOpenMobile);
  };
  const onNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  const onToggle = isMobileView ? onNavToggleMobile : onNavToggle;

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
      onPageResize={onPageResize}
      header={
        <Header
          {...{ isNavOpen, onToggle, onNotificationsToggle }}
          noEnv={!Boolean(environmentId)}
        />
      }
      sidebar={<Sidebar environment={environmentId} />}
    >
      {children}
    </Page>
  );
};
