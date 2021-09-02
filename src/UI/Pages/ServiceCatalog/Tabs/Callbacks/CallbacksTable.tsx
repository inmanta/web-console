import React from "react";
import { Callback } from "@/Core";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import { Row } from "./Row";
import { CreateCallbackForm } from "./CreateCallbackForm";
import { ExpansionManager } from "@/UI/Pages/ServiceInventory/ExpansionManager";

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
    <TableComposable>
      <Thead>
        <Tr>
          <Th />
          <Th>Url</Th>
          <Th>Id</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      {callbacks.map((cb, index) => (
        <Row
          index={index}
          onToggle={handleExpansionToggle(cb.callback_id)}
          isExpanded={expansionState[cb.callback_id]}
          key={cb.callback_id}
          callback={cb}
          service_entity={service_entity}
          numberOfColumns={4}
        />
      ))}
      <CreateCallbackForm service_entity={service_entity} numberOfColumns={4} />
    </TableComposable>
  );
};

function getIds(callbacks: Callback[]): string[] {
  return callbacks.map((callback) => callback.callback_id);
}
