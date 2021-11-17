import React from "react";
import { EventRow, InstanceEvent, RouteKind } from "@/Core";
import { useUrlStateWithExpansion } from "@/Data";
import { TablePresenter } from "@/UI/Presenters";
import { EventsTableRow } from "./EventsTableRow";

interface Props {
  events: InstanceEvent[];
  tablePresenter: TablePresenter<InstanceEvent, EventRow>;
  route: RouteKind;
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
