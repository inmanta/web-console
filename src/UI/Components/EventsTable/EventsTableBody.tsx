import React from "react";
import { EventRow, InstanceEvent, toggleValueInList } from "@/Core";
import { TablePresenter } from "@/UI/Presenters";
import { EventsTableRow } from "./EventsTableRow";
import { useUrlStateWithExpansion } from "@/Data";
import { Kind } from "@/UI/Routing";

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
  const [expandedKeys, setExpandedKeys] = useUrlStateWithExpansion({ route });

  const handleExpansionToggle = (id: string) => () => {
    setExpandedKeys(toggleValueInList(id, expandedKeys));
  };

  React.useEffect(() => {
    setExpandedKeys(rowsToIds(events).filter((v) => expandedKeys.includes(v)));
  }, [`${rowsToIds(events)}`]);

  const rows = tablePresenter.createRows(events);
  return (
    <>
      {rows.map((row, index) => (
        <EventsTableRow
          index={index}
          key={row.id}
          isExpanded={expandedKeys.includes(row.id)}
          onToggle={handleExpansionToggle(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          row={row}
        />
      ))}
    </>
  );
};
function rowsToIds(rows: InstanceEvent[]): string[] {
  return rows.map((row) => row.id);
}
