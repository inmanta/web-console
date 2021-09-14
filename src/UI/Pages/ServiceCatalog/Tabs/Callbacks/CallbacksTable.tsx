import React from "react";
import { Callback } from "@/Core";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import { Row } from "./Row";
import { CreateCallbackForm } from "./CreateCallbackForm";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";
import { words } from "@/UI/words";

interface Props {
  callbacks: Callback[];
  service_entity: string;
}

export const CallbacksTable: React.FC<Props> = ({
  callbacks,
  service_entity,
}) => {
  const expansionManager = new ExpansionManager();
  const [expansionState, setExpansionState] = React.useState(
    expansionManager.create(getIds(callbacks))
  );
  const handleExpansionToggle = (id: string) => () => {
    setExpansionState(expansionManager.toggle(expansionState, id));
  };
  React.useEffect(() => {
    setExpansionState(
      expansionManager.merge(expansionState, getIds(callbacks))
    );
  }, [callbacks]);
  return (
    <TableComposable aria-label="CallbacksTable">
      <Thead>
        <Tr>
          <Th>{words("catalog.callbacks.url")}</Th>
          <Th>{words("catalog.callbacks.id")}</Th>
          <Th id="MinimalLogLevelHeader" aria-label="MinimalLogLevel">
            {words("catalog.callbacks.minimalLogLevel")}
          </Th>
          <Th id="EventTypesHeader" aria-label="EventTypes">
            {words("catalog.callbacks.eventTypes")}
          </Th>
          <Th>{words("catalog.callbacks.actions")}</Th>
        </Tr>
      </Thead>
      <CreateCallbackForm service_entity={service_entity} numberOfColumns={5} />
      {callbacks.map((cb) => (
        <Row
          onToggle={handleExpansionToggle(cb.callback_id)}
          isExpanded={expansionState[cb.callback_id]}
          key={cb.callback_id}
          callback={cb}
          service_entity={service_entity}
          numberOfColumns={5}
        />
      ))}
    </TableComposable>
  );
};

function getIds(callbacks: Callback[]): string[] {
  return callbacks.map((callback) => callback.callback_id);
}
