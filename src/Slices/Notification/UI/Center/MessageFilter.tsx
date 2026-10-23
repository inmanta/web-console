import React from "react";
import { words } from "@/Core";
import { NotificationFilter } from "@/Data/Queries/Slices/Notification";
import { FreeTextFilter } from "@/UI/Components/Filters";

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
