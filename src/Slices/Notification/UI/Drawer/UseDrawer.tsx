import React, { useEffect, useRef, useState } from "react";
import { Drawer } from "./Drawer";

type UseDrawer = (env: boolean) => {
  notificationDrawer: JSX.Element | undefined;
  onNotificationDrawerExpand: (() => void) | undefined;
  isNotificationDrawerExpanded: boolean;
  onNotificationsToggle: (() => void) | (() => undefined);
};

export const useDrawer: UseDrawer = (env) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>();
  const onDrawerClose = () => setIsDrawerOpen(false);

  const onDrawerOpen = () => {
    if (!drawerRef.current) return;
    const firstTabbableItem =
      drawerRef.current.querySelector<HTMLDivElement>("a, button");
    if (!firstTabbableItem) return;
    firstTabbableItem.focus();
  };

  const [
    notificationDrawer,
    onNotificationDrawerExpand,
    isNotificationDrawerExpanded,
    onNotificationsToggle,
  ] = env
    ? [
        <Drawer onClose={onDrawerClose} drawerRef={drawerRef} key="drawer" />,
        onDrawerOpen,
        isDrawerOpen,
        () => setIsDrawerOpen(!isDrawerOpen),
      ]
    : [undefined, undefined, false, () => undefined];

  useEffect(() => {
    if (!env) setIsDrawerOpen(false);
  }, [env]);

  return {
    notificationDrawer,
    onNotificationDrawerExpand,
    isNotificationDrawerExpanded,
    onNotificationsToggle,
  };
};
