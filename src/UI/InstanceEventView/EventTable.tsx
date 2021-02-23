import { InstanceEvent } from "@/Core";
import React from "react";
import { ExpansionManager } from "../ServiceInventory/ExpansionManager";
import { EventTablePresenter } from "./EventTablePresenter";
import { EventTableRow } from "./EventTableRow";

interface Props {
  events: InstanceEvent[];
  tablePresenter: EventTablePresenter;
  environmentId: string;
}

export const EventTable: React.FC<Props> = ({
  events,
  tablePresenter,
  environmentId,
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
  const rows = tablePresenter.createFromEvents(events);
  return (
    <>
      {rows.map((row, index) => (
        <EventTableRow
          index={index}
          key={row.id}
          isExpanded={expansionState[row.id]}
          onToggle={handleExpansionToggle(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          row={row}
          environmentId={environmentId}
        />
      ))}
    </>
  );
};
function rowsToIds(rows: InstanceEvent[]): string[] {
  return rows.map((row) => row.id);
}
