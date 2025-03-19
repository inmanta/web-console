import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { useUpdateNotification } from "@/Data/Managers/V2/Notification/UpdateNotification";
import { words } from "@/UI/words";

interface Props {
  read: boolean;
  id: string;
  onUpdate(): void;
}

export const ActionList: React.FC<Props> = ({ read, id, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useUpdateNotification({
    onSuccess: () => {
      onUpdate();
    },
  });

  const onRead = () => mutate({ body: { read: true }, ids: [id] });
  const onUnread = () => mutate({ body: { read: false }, ids: [id] });

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      popperProps={{ position: "center" }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="notifications-dropdown"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<EllipsisVIcon />}
        />
      )}
    >
      <DropdownItem
        key="read"
        component="button"
        isDisabled={read}
        onClick={onRead}
      >
        {words("notification.read")}
      </DropdownItem>
      <DropdownItem
        key="unread"
        component="button"
        isDisabled={!read}
        onClick={onUnread}
      >
        {words("notification.unread")}
      </DropdownItem>
    </Dropdown>
  );
};
