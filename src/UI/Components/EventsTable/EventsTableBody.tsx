import { EventRow, InstanceEvent } from "@/Core";
import React from "react";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";
import { TablePresenter } from "@/UI/Pages/ServiceInventory/Presenters";
import { EventsTableRow } from "./EventsTableRow";

interface Props {
  events: InstanceEvent[];
  tablePresenter: TablePresenter<InstanceEvent, EventRow>;
}

export const EventsTableBody: React.FC<Props> = ({
  events,
  tablePresenter,
}) => {
  const expansionManager = new ExpansionManager();

  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(rowsToIds(events))
  );

  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };

  React.useEffect(() => {
    setExpansionState(
      expansionManager.merge(expansionState, rowsToIds(events))
    );
  }, [events]);
  const rows = tablePresenter.createRows(events);
  return (
    <>
      {rows.map((row, index) => (
        <EventsTableRow
          index={index}
          key={row.id}
          isExpanded={expansionState[row.id]}
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
