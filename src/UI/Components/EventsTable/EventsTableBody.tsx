import React from "react";
import { EventRow, InstanceEvent } from "@/Core";
import { useUrlStateWithExpansion } from "@/Data";
import { TablePresenter } from "@/UI/Presenters";
import { Kind } from "@/UI/Routing";
import { EventsTableRow } from "./EventsTableRow";

interface Props {
  events: InstanceEvent[];
  tablePresenter: TablePresenter<InstanceEvent, EventRow>;
  route: Kind;
}

export const EventsTableBody: React.FC<Props> = ({
  events,
  tablePresenter,
  route,
}) => {
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route,
  });

  const rows = tablePresenter.createRows(events);
  return (
    <>
      {rows.map((row, index) => (
        <EventsTableRow
          index={index}
          key={row.id}
          isExpanded={isExpanded(row.id)}
          onToggle={onExpansion(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          row={row}
        />
      ))}
    </>
  );
};
