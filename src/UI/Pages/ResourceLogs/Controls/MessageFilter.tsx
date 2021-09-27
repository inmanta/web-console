import React from "react";
import { ResourceLogFilter } from "@/Core";
import { FreeTextFilter } from "@/UI/Components/Filters";

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
      isVisible
      searchEntries={filter.message}
      filterPropertyName={"Message"}
      placeholder={"Message..."}
      update={update}
    />
  );
};
