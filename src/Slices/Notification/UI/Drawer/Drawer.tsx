import React, {
  MutableRefObject,
  useContext,
  useEffect,
  useState,
} from "react";
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
import { UseQueryResult } from "@tanstack/react-query";
import { PageSize } from "@/Core";
import {
  NotificationResponse,
  useGetNotifications,
} from "@/Data/Managers/V2/Notification/GetNotifications";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Body } from "@S/Notification/Core/Domain";
import { Item, OnUpdate } from "./Item";

interface Props {
  onClose(event?: MouseEvent): void;
  isDrawerOpen: boolean;
  drawerRef: MutableRefObject<HTMLDivElement | undefined>;
}

export const Drawer: React.FC<Props> = ({
  onClose,
  isDrawerOpen,
  drawerRef,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const response = useGetNotifications({
    pageSize: PageSize.from("250"),
    origin: "drawer",
    currentPage: { kind: "CurrentPage", value: "" },
  }).useContinuous();

  const trigger = commandResolver.useGetTrigger<"UpdateNotification">({
    kind: "UpdateNotification",
    origin: "drawer",
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

  return <View {...{ response, onClose, isDrawerOpen, trigger, drawerRef }} />;
};

interface ViewProps extends Props {
  response: UseQueryResult<NotificationResponse, Error>;
  trigger(body: Body, ids: string[]): void;
}

const View: React.FC<ViewProps> = ({
  response,
  onClose,
  trigger,
  drawerRef,
}) => {
  const count = response.isSuccess
    ? response.data.data.filter((n) => !n.read).length
    : 0;

  const getOnUpdate =
    (ids: string[]): OnUpdate =>
    async (body) => {
      trigger(body, ids);
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

interface ActionListProps {
  onClearAll(): void;
  onReadAll(): void;
  onClose(): void;
}

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
