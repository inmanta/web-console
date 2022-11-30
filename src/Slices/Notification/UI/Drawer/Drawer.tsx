import React, { MutableRefObject, useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  KebabToggle,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
} from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Body } from "@S/Notification/Core/Domain";
import { drawerQuery, ViewData } from "@S/Notification/Core/Query";
import { Item, OnUpdate } from "./Item";

interface Props {
  onClose(): void;
  drawerRef: MutableRefObject<HTMLDivElement | undefined>;
}

export const Drawer: React.FC<Props> = ({ onClose, drawerRef }) => {
  const { commandResolver, queryResolver } = useContext(DependencyContext);
  const data = queryResolver.useReadOnly<"GetNotifications">(drawerQuery);

  const trigger = commandResolver.useGetTrigger<"UpdateNotification">({
    kind: "UpdateNotification",
    origin: "drawer",
  });

  return <View {...{ data, onClose, trigger, drawerRef }} />;
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
      data
    ),
    undefined
  );

  const getOnUpdate =
    (ids: string[]): OnUpdate =>
    async (body) => {
      trigger(body, ids);
    };

  const onClearAll = () => {
    if (!RemoteData.isSuccess(data)) return;
    getOnUpdate(data.value.data.map((notification) => notification.id))({
      cleared: true,
    });
  };

  const onReadAll = () => {
    if (!RemoteData.isSuccess(data)) return;
    getOnUpdate(
      data.value.data
        .filter((notification) => !notification.read)
        .map((notification) => notification.id)
    )({ read: true });
  };

  return (
    <NotificationDrawer ref={drawerRef} aria-label="NotificationDrawer">
      <NotificationDrawerHeader count={count} onClose={onClose}>
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
                    {...{ notification }}
                    key={notification.id}
                    onUpdate={getOnUpdate([notification.id])}
                  />
                )),
            },
            data
          )}
        </CustomNotificationDrawerList>
      </CustomNotificationDrawerBody>
    </NotificationDrawer>
  );
};

const CustomNotificationDrawerBody = styled(NotificationDrawerBody)`
  padding-bottom: 300px;
  background-color: var(--pf-global--BackgroundColor--200);
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

  return (
    <Dropdown
      onSelect={() => setIsOpen(false)}
      toggle={
        <KebabToggle
          onToggle={setIsOpen}
          aria-label="NotificationListActions"
        />
      }
      isOpen={isOpen}
      isPlain
      dropdownItems={[
        <DropdownItem key="readAll" component="button" onClick={onReadAll}>
          {words("notification.drawer.readAll")}
        </DropdownItem>,
        <DropdownItem key="clearAll" component="button" onClick={onClearAll}>
          {words("notification.drawer.clearAll")}
        </DropdownItem>,
        <DropdownItem key="seeAll" component="button" onClick={onShowAll}>
          {words("notification.drawer.showAll")}
        </DropdownItem>,
      ]}
      id="notification-0"
      position="right"
    />
  );
};
