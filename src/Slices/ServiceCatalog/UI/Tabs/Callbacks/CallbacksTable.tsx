import React from "react";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import { useUrlStateWithExpansion } from "@/Data";
import { words } from "@/UI/words";
import { Callback } from "@S/ServiceCatalog/Core/Callback";
import { CreateCallbackForm } from "./CreateCallbackForm";
import { Row } from "./Row";

interface Props {
  callbacks: Callback[];
  service_entity: string;
}

export const CallbacksTable: React.FC<Props> = ({
  callbacks,
  service_entity,
}) => {
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    key: "callbacks-expansion",
    route: "Catalog",
  });

  return (
    <TableComposable aria-label="CallbacksTable">
      <Thead>
        <Tr>
          <Th>{words("catalog.callbacks.url")}</Th>
          <Th>{words("catalog.callbacks.id")}</Th>
          <Th>{words("catalog.callbacks.minimalLogLevel")}</Th>
          <Th>{words("catalog.callbacks.eventTypes")}</Th>
          <Th>{words("catalog.callbacks.actions")}</Th>
        </Tr>
      </Thead>
      <CreateCallbackForm service_entity={service_entity} numberOfColumns={5} />
      {callbacks.map((cb) => (
        <Row
          onToggle={onExpansion(cb.callback_id)}
          isExpanded={isExpanded(cb.callback_id)}
          key={cb.callback_id}
          callback={cb}
          service_entity={service_entity}
          numberOfColumns={5}
        />
      ))}
    </TableComposable>
  );
};
