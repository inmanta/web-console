import React from "react";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  OnSort,
} from "@patternfly/react-table";
import { Sort } from "@/Core";
import { Status } from "@/Core/Domain/Resource/Resource";
import { useUrlStateWithExpansion } from "@/Data";
import { ResourceStatusLabel } from "@/UI/Components";
import { SortKeyV2 } from "../Core/Query";
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
  sort: Sort.Type<SortKeyV2>;
  setSort: (sort: Sort.Type<SortKeyV2>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ComposableTableExpandable: React.FunctionComponent<
  ComposableTableExpandableProps
> = ({ rows, sort, setSort }) => {
  const ressourceRows: RessourceRow[] = rows;

  const columnNames = {
    expend: "",
    resource_type: "Type",
    agent: "Agent",
    resource_id_value: "Value",
    dependeciesNbr: "Number of Dependecies",
    status: "Deploy state",
  };
  const sortableColumnNames = ["resource_type", "status"];

  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route: "ResourcesV2",
  });

  const getColumnNameForIndex = (index: number): string | undefined => {
    const columnNamesArray = Object.keys(columnNames);
    if (index > -1 && index < columnNamesArray.length) {
      return columnNamesArray[index];
    }
    return undefined;
  };

  const getIndexForColumnName = (columnName?: string): number => {
    const columnNamesArray = Object.keys(columnNames);
    return columnNamesArray.findIndex(
      (columnHead) => columnHead === columnName
    );
  };

  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: getColumnNameForIndex(index) as SortKeyV2,
      order,
    });
  };
  const activeSortIndex = getIndexForColumnName(sort.name);

  const heads = Object.entries(columnNames).map(([key, value], columnIndex) => {
    const hasSort = sortableColumnNames.includes(key);
    const sortParams = hasSort
      ? {
          sort: {
            sortBy: {
              index: activeSortIndex,
              direction: sort.order,
            },
            onSort,
            columnIndex,
          },
        }
      : {};
    return (
      <Th key={columnIndex} {...sortParams}>
        {value}
      </Th>
    );
  });

  return (
    <React.Fragment>
      <TableComposable aria-label="Ressources table V2">
        <Thead>
          <Tr>{heads}</Tr>
        </Thead>
        {ressourceRows.map((resource, rowIndex) => {
          return (
            <Tbody key={resource.id} isExpanded={isExpanded(resource.id)}>
              <Tr aria-label="Resource V2 Table Row">
                <Td
                  expand={{
                    rowIndex,
                    isExpanded: isExpanded(resource.id),
                    onToggle: onExpansion(resource.id),
                  }}
                />
                <Td dataLabel={columnNames.resource_type}>{resource.type}</Td>
                <Td dataLabel={columnNames.agent}>{resource.agent}</Td>
                <Td dataLabel={columnNames.resource_id_value}>
                  {resource.value}
                </Td>
                <Td dataLabel={columnNames.dependeciesNbr}>
                  {resource.dependeciesNbr}
                </Td>
                <Td dataLabel={columnNames.status}>
                  <ResourceStatusLabel status={resource.deployState} />
                </Td>
              </Tr>
              <Tr isExpanded={isExpanded(resource.id)}>
                <Td noPadding colSpan={6}>
                  <ResourceTabs
                    resource={resource}
                    isExpanded={isExpanded(resource.id)}
                  />
                </Td>
              </Tr>
            </Tbody>
          );
        })}
      </TableComposable>
    </React.Fragment>
  );
};
