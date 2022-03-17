import React, { useRef, useState } from "react";
import { Page } from "@patternfly/react-core";
import { Header } from "@/UI/Root/Components/Header";
import { PageBreadcrumbs } from "@/UI/Root/Components/PageBreadcrumbs";
import { Sidebar } from "@/UI/Root/Components/Sidebar";
import { Drawer } from "@S/Notification/UI/Drawer";

interface Props {
  environmentId?: string;
}

export const PageFrame: React.FC<Props> = ({ children, environmentId }) => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isNavOpenMobile, setIsNavOpenMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>();

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

  const onDrawerClose = () => setIsDrawerOpen(false);

  const onDrawerOpen = () => {
    if (!drawerRef.current) return;
    const firstTabbableItem =
      drawerRef.current.querySelector<HTMLDivElement>("a, button");
    if (!firstTabbableItem) return;
    firstTabbableItem.focus();
  };

  return (
    <Page
      notificationDrawer={
        <Drawer onClose={onDrawerClose} drawerRef={drawerRef} />
      }
      onNotificationDrawerExpand={onDrawerOpen}
      isNotificationDrawerExpanded={isDrawerOpen}
      breadcrumb={<PageBreadcrumbs />}
      onPageResize={onPageResize}
      header={
        <Header
          noEnv={!Boolean(environmentId)}
          isNavOpen={isNavOpen}
          onToggle={onToggle}
          onNotificationsToggle={() => setIsDrawerOpen(!isDrawerOpen)}
        />
      }
      sidebar={
        <Sidebar
          isNavOpen={isMobileView ? isNavOpenMobile : isNavOpen}
          environment={environmentId}
        />
      }
    >
      {children}
    </Page>
  );
};
