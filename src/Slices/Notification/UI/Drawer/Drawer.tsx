import React, { MutableRefObject, useEffect, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { UseMutateFunction, UseQueryResult } from "@tanstack/react-query";
import { PageSize } from "@/Core";
import {
  NotificationResponse,
  useGetNotifications,
} from "@/Data/Managers/V2/Notification/GetNotifications";
import {
  UpdateNotificationParams,
  useUpdateNotification,
} from "@/Data/Managers/V2/Notification/UpdateNotification";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Item, OnUpdate } from "./Item";

/**
 * Props for the Drawer component.
 *
 * @property {(event?: MouseEvent) => void} onClose - Function to handle drawer closing
 * @property {boolean} isDrawerOpen - Whether the drawer is currently open
 * @property {MutableRefObject<HTMLDivElement | undefined>} drawerRef - Ref to the drawer DOM element
 */
interface Props {
  onClose(event?: MouseEvent): void;
  isDrawerOpen: boolean;
  drawerRef: MutableRefObject<HTMLDivElement | undefined>;
}

/**
 * Main notification drawer component that displays a list of notifications.
 * Provides functionality to view, mark as read/unread, and clear notifications.
 */
export const Drawer: React.FC<Props> = ({
  onClose,
  isDrawerOpen,
  drawerRef,
}) => {
  const response = useGetNotifications({
    pageSize: PageSize.from("50"),
    origin: "drawer",
    currentPage: { kind: "CurrentPage", value: "" },
  }).useContinuous();

  const { mutate } = useUpdateNotification({
    onSuccess: () => {
      onClose();
      response.refetch();
    },
  });

  useEffect(() => {
    const close = (event) => {
      const target = event.target as Node;
      const wasTargetOutsideSidebar = !drawerRef.current?.contains(target);

      if (isDrawerOpen && wasTargetOutsideSidebar) {
        onClose();
      }
    };

    document.addEventListener("click", close);

    return () => {
      document.removeEventListener("click", close);
    };
  }, [drawerRef, isDrawerOpen, onClose]);

  return <View {...{ response, onClose, isDrawerOpen, mutate, drawerRef }} />;
};

/**
 * Props for the View component that extends the main Drawer props.
 *
 * @property {UseQueryResult<NotificationResponse, Error>} response - Query result containing notification data
 * @property {UseMutateFunction<void, Error, UpdateNotificationParams, unknown>} mutate - Function to update notifications
 */
interface ViewProps extends Props {
  response: UseQueryResult<NotificationResponse, Error>;
  mutate: UseMutateFunction<void, Error, UpdateNotificationParams, unknown>;
}

/**
 * Internal view component that renders the notification drawer content.
 * Handles the display of notifications and provides actions for managing them.
 */
const View: React.FC<ViewProps> = ({
  response,
  onClose,
  mutate,
  drawerRef,
}) => {
  const count = response.isSuccess
    ? response.data.data.filter((notification) => !notification.read).length
    : 0;

  const getOnUpdate =
    (ids: string[]): OnUpdate =>
      (body) => {
        mutate({ body, ids });
      };

  const onClearAll = () => {
    if (!response.isSuccess) return;

    getOnUpdate(response.data.data.map((notification) => notification.id))({
      read: true,
      cleared: true,
    });
  };

  const onReadAll = () => {
    if (!response.isSuccess) return;

    getOnUpdate(
      response.data.data
        .filter((notification) => !notification.read)
        .map((notification) => notification.id),
    )({ read: true });
  };

  return (
    <NotificationDrawer
      ref={drawerRef}
      aria-label="NotificationDrawer"
      id="notificationDrawer"
    >
      <NotificationDrawerHeader count={count} onClose={() => onClose()}>
        <ActionList {...{ onClearAll, onReadAll, onClose }} />
      </NotificationDrawerHeader>
      <NotificationDrawerBody>
        <NotificationDrawerList>
          {response.isSuccess
            ? response.data.data.map((notification) => (
              <Item
                data-testid="menuitem"
                {...{ notification }}
                key={notification.id}
                onUpdate={getOnUpdate([notification.id])}
              />
            ))
            : null}
        </NotificationDrawerList>
      </NotificationDrawerBody>
    </NotificationDrawer>
  );
};

/**
 * Props for the ActionList component.
 *
 * @property {() => void} onClearAll - Function to clear all notifications
 * @property {() => void} onReadAll - Function to mark all notifications as read
 * @property {() => void} onClose - Function to close the drawer
 */
interface ActionListProps {
  onClearAll(): void;
  onReadAll(): void;
  onClose(): void;
}

/**
 * Component that renders a dropdown menu with actions for all notifications.
 * Provides options to clear all, mark all as read, and navigate to notifications page.
 */
const ActionList: React.FC<ActionListProps> = ({
  onClearAll,
  onReadAll,
  onClose,
}) => {
  const navigateTo = useNavigateTo();
  const [isOpen, setIsOpen] = useState(false);

  const onShowAll = () => {
    navigateTo("NotificationCenter", undefined);
    onClose();
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      onSelect={() => setIsOpen(false)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="NotificationListActions"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<EllipsisVIcon />}
        />
      )}
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      popperProps={{ position: "center" }}
      id="notification-0"
    >
      <DropdownList>
        <DropdownItem key="readAll" component="button" onClick={onReadAll}>
          {words("notification.drawer.readAll")}
        </DropdownItem>
        <DropdownItem key="clearAll" component="button" onClick={onClearAll}>
          {words("notification.drawer.clearAll")}
        </DropdownItem>
        <DropdownItem key="seeAll" component="button" onClick={onShowAll}>
          {words("notification.drawer.showAll")}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
