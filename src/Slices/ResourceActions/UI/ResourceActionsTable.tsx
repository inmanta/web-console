import React from "react";
import { Table, Th, Thead, Tr } from "@patternfly/react-table";
import { useUrlStateWithExpansion } from "@/Data";
import { words } from "@/UI/words";
import { ResourceAction } from "@S/ResourceActions/Core/Domain";
import { Row } from "./Row";

interface Props {
  actions: ResourceAction[];
}

const NUMBER_OF_COLUMNS = 8;

/**
 * The changelog table, listing resource actions with expandable rows.
 *
 * @props {Props} props - The props of the component.
 *  @prop {ResourceAction[]} actions - The resource actions to display.
 * @returns {React.FC<Props>} The table component.
 */
export const ResourceActionsTable: React.FC<Props> = ({ actions }) => {
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    key: "actions-expansion",
    route: "ResourceActions",
  });

  return (
    <Table aria-label="ResourceActionsTable" variant="compact">
      <Thead>
        <Tr>
          <Th aria-hidden screenReaderText={words("common.emptyColumnHeader")} />
          <Th>{words("resourceActions.column.started")}</Th>
          <Th>{words("resourceActions.column.duration")}</Th>
          <Th>{words("resourceActions.column.resource")}</Th>
          <Th>{words("resourceActions.column.type")}</Th>
          <Th>{words("resourceActions.column.status")}</Th>
          <Th>{words("resourceActions.column.reason")}</Th>
          <Th>{words("resourceActions.column.outcome")}</Th>
        </Tr>
      </Thead>
      {actions.map((action, index) => (
        <Row
          key={getUniqueId(action)}
          index={index}
          action={action}
          isExpanded={isExpanded(getUniqueId(action))}
          onToggle={onExpansion(getUniqueId(action))}
          numberOfColumns={NUMBER_OF_COLUMNS}
        />
      ))}
    </Table>
  );
};

function getUniqueId(action: ResourceAction): string {
  return `${action.action_id}_${action.started}`;
}
