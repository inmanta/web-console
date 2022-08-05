import React from "react";
import { DateRange } from "@/Core";
import { TimestampFilter as TimestampFilterWidget } from "@/UI/Components";
import { MomentDatePresenter } from "@/UI/Utils";
import { ResourceLogFilter } from "@S/ResourceDetails/Core/ResourceLog";

interface Props {
  filter: ResourceLogFilter;
  setFilter: (filter: ResourceLogFilter) => void;
}

export const TimestampFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const update = (timestampFilters: DateRange.Type[]) =>
    setFilter({
      ...filter,
      timestamp: timestampFilters.length > 0 ? timestampFilters : undefined,
    });

  return (
    <TimestampFilterWidget
      datePresenter={new MomentDatePresenter()}
      timestampFilters={filter.timestamp ? filter.timestamp : []}
      update={update}
      isVisible
    />
  );
};
