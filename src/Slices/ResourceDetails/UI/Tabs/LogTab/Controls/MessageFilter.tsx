import React from "react";
import { FreeTextFilter } from "@/UI/Components/Filters";
import { words } from "@/UI/words";
import { ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";

interface Props {
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
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
      placeholder={words("resources.logs.message.placeholder")}
      update={update}
    />
  );
};
