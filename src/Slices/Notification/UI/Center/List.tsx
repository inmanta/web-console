import React, { useContext, useState } from "react";
import {
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Dropdown,
  DropdownItem,
  KebabToggle,
} from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { Model } from "@S/Notification/Core/Model";
import { Manifest } from "@S/Notification/Core/Query";

interface Props {
  data: Manifest["usedData"]["data"];
  onUpdate(): void;
}

export const List: React.FC<Props> = ({ data, onUpdate }) => {
  return (
    <DataList aria-label="NotificationList">
      {data.map((notification) => (
        <Row {...{ notification, onUpdate }} key={notification.id} />
      ))}
    </DataList>
  );
};

interface ItemProps {
  notification: Model;
  onUpdate(): void;
}

const Row: React.FC<ItemProps> = ({ notification, onUpdate }) => {
  return (
    <DataListItem aria-label="NotificationRow">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="primary content">
              <p>{notification.title}</p>
              <p>{notification.message}</p>
            </DataListCell>,
            <DataListCell key="secondary content">
              {new MomentDatePresenter().get(notification.created).relative}
            </DataListCell>,
          ]}
        />
        <DataListAction
          aria-labelledby="multi-actions-item1 multi-actions-action1"
          id="multi-actions-action1"
          aria-label="Actions"
          isPlainButtonAction
        >
          <ActionList {...{ onUpdate }} {...notification} />
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};

interface ActionProps {
  read: boolean;
  id: string;
  onUpdate(): void;
}

const ActionList: React.FC<ActionProps> = ({ read, id, onUpdate }) => {
  const { commandResolver } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const trigger = commandResolver.getTrigger<"UpdateNotification">({
    kind: "UpdateNotification",
    origin: "center",
  });

  const onRead = () => trigger({ read: true }, [id], onUpdate);
  const onUnread = () => trigger({ read: false }, [id], onUpdate);

  return (
    <Dropdown
      isPlain
      position="right"
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      toggle={<KebabToggle onToggle={setIsOpen} />}
      dropdownItems={[
        <DropdownItem
          key="read"
          component="button"
          isDisabled={read}
          onClick={onRead}
        >
          Mark as read
        </DropdownItem>,
        <DropdownItem
          key="unread"
          component="button"
          isDisabled={!read}
          onClick={onUnread}
        >
          Mark as unread
        </DropdownItem>,
      ]}
    />
  );
};
