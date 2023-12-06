import React, { useContext, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  read: boolean;
  id: string;
  onUpdate(): void;
}

export const ActionList: React.FC<Props> = ({ read, id, onUpdate }) => {
  const { commandResolver } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const trigger = commandResolver.useGetTrigger<"UpdateNotification">({
    kind: "UpdateNotification",
    origin: "center",
  });

  const onRead = () => trigger({ read: true }, [id], onUpdate);
  const onUnread = () => trigger({ read: false }, [id], onUpdate);

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
        >
          <EllipsisVIcon />
        </MenuToggle>
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
