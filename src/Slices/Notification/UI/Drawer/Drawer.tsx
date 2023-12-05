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
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Body } from "@S/Notification/Core/Domain";
import { drawerQuery, ViewData } from "@S/Notification/Core/Query";
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
  const { commandResolver, queryResolver } = useContext(DependencyContext);
  const data = queryResolver.useReadOnly<"GetNotifications">(drawerQuery);

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

  return <View {...{ data, onClose, isDrawerOpen, trigger, drawerRef }} />;
};

interface ViewProps extends Props {
  data: ViewData;
  trigger(body: Body, ids: string[]): void;
}

export const View: React.FC<ViewProps> = ({
  data,
  onClose,
  trigger,
  drawerRef,
}) => {
  const count = RemoteData.withFallback(
    RemoteData.mapSuccess(
      (info) => info.data.filter((n) => !n.read).length,
      data,
    ),
    undefined,
  );

  const getOnUpdate =
    (ids: string[]): OnUpdate =>
    async (body) => {
      trigger(body, ids);
    };

  const onClearAll = () => {
    if (!RemoteData.isSuccess(data)) return;
    getOnUpdate(data.value.data.map((notification) => notification.id))({
      read: true,
      cleared: true,
    });
  };

  const onReadAll = () => {
    if (!RemoteData.isSuccess(data)) return;
    getOnUpdate(
      data.value.data
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
      <CustomNotificationDrawerBody>
        <CustomNotificationDrawerList>
          {RemoteData.fold(
            {
              notAsked: () => null,
              loading: () => null,
              failed: () => null,
              success: ({ data }) =>
                data.map((notification) => (
                  <Item
                    data-testid="menuitem"
                    {...{ notification }}
                    key={notification.id}
                    onUpdate={getOnUpdate([notification.id])}
                  />
                )),
            },
            data,
          )}
        </CustomNotificationDrawerList>
      </CustomNotificationDrawerBody>
    </NotificationDrawer>
  );
};

const CustomNotificationDrawerBody = styled(NotificationDrawerBody)`
  padding-bottom: 300px;
  background-color: var(--pf-v5-global--BackgroundColor--200);
`;

const CustomNotificationDrawerList = styled(NotificationDrawerList)`
  overflow-y: visible;
`;

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
        >
          <EllipsisVIcon />
        </MenuToggle>
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
