import React from "react";
import { NotificationFilter } from "@/Data/Managers/V2/Notification/GetNotifications";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";

interface Props {
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
}

export const MessageFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (messageValues: string[]) => {
    setFilter({
      ...filter,
      message: messageValues.length > 0 ? messageValues : undefined,
    });
  };

  return (
    <FreeTextFilter
      searchEntries={filter.message}
      filterPropertyName={"Message"}
      placeholder={words("notification.message.placeholder")}
      update={update}
    />
  );
};
