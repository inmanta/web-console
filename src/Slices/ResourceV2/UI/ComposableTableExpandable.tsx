import React from "react";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ExpandableRowContent,
  ThProps,
} from "@patternfly/react-table";
import { Status } from "@/Core/Domain/Resource/Resource";
import { useUrlStateWithExpansion } from "@/Data";
import { ResourceLink, ResourceStatusLabel } from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceTabs } from "./ResourceTabs";

export interface RessourceRow {
  id: string;
  type: string;
  agent: string;
  value: string;
  dependeciesNbr: number;
  deployState: Status;
}

interface ComposableTableExpandableProps {
  rows: RessourceRow[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ComposableTableExpandable: React.FunctionComponent<
  ComposableTableExpandableProps
> = ({ rows }) => {
  const ressourceRows: RessourceRow[] = rows;

  const columnNames = {
    type: "Type",
    agent: "Agent",
    value: "Value",
    dependeciesNbr: "Number of Dependecies",
    deployState: "Deploy state",
  };

  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route: "ResourcesV2",
  });

  const [activeSortIndex, setActiveSortIndex] = React.useState<
    number | undefined
  >(undefined);

  const [activeSortDirection, setActiveSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(undefined);

  const getSortableRowValues = (row: RessourceRow): (string | number)[] => {
    const { type, agent, value, dependeciesNbr, deployState } = row;
    return [type, agent, value, dependeciesNbr, deployState];
  };

  let sortedRows = ressourceRows;
  if (activeSortIndex !== undefined) {
    sortedRows = ressourceRows.sort((a, b) => {
      const aValue = getSortableRowValues(a)[activeSortIndex];
      const bValue = getSortableRowValues(b)[activeSortIndex];
      if (typeof aValue === "number") {
        // Numeric sort
        if (activeSortDirection === "asc") {
          return (aValue as number) - (bValue as number);
        }
        return (bValue as number) - (aValue as number);
      } else {
        // String sort
        if (activeSortDirection === "asc") {
          return (aValue as string).localeCompare(bValue as string);
        }
        return (bValue as string).localeCompare(aValue as string);
      }
    });
  }

  const getSortParams = (columnIndex: number): ThProps["sort"] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: "asc",
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  return (
    <React.Fragment>
      <TableComposable aria-label="Ressources table V2">
        <Thead>
          <Tr>
            <Th />
            <Th sort={getSortParams(0)}>{columnNames.type}</Th>
            <Th>{columnNames.agent}</Th>
            <Th>{columnNames.value}</Th>
            <Th sort={getSortParams(3)}>{columnNames.dependeciesNbr}</Th>
            <Th sort={getSortParams(4)}>{columnNames.deployState}</Th>
            <Th></Th>
          </Tr>
        </Thead>
        {sortedRows.map((resource, rowIndex) => {
          return (
            <Tbody key={resource.id} isExpanded={isExpanded(resource.id)}>
              <Tr>
                <Td
                  expand={{
                    rowIndex,
                    isExpanded: isExpanded(resource.id),
                    onToggle: onExpansion(resource.id),
                  }}
                />
                <Td dataLabel={columnNames.type}>{resource.type}</Td>
                <Td dataLabel={columnNames.agent}>{resource.agent}</Td>
                <Td dataLabel={columnNames.value}>{resource.value}</Td>
                <Td dataLabel={columnNames.dependeciesNbr}>
                  {resource.dependeciesNbr}
                </Td>
                <Td dataLabel={columnNames.deployState}>
                  <ResourceStatusLabel status={resource.deployState} />
                </Td>
                <Td>
                  <ResourceLink
                    resourceId={resource.id}
                    linkText={words("resources.link.details")}
                  />
                </Td>
              </Tr>
              <Tr isExpanded={isExpanded(resource.id)}>
                <Td noPadding colSpan={6}>
                  <ExpandableRowContent>
                    <ResourceTabs resource={resource} />
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          );
        })}
      </TableComposable>
    </React.Fragment>
  );
};
