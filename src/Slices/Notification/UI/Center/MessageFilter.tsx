import React from "react";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { Filter } from "@S/Notification/Core/Query";

interface Props {
  filter: Filter;
  setFilter: (filter: Filter) => void;
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
