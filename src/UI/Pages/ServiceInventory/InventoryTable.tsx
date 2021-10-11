import React from "react";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  OnSort,
} from "@patternfly/react-table";
import { Row, Sort, toggleValueInList } from "@/Core";
import { InventoryTablePresenter } from "./Presenters";
import { InstanceRow } from "./InstanceRow";
import { useUrlStateWithExpansion } from "@/Data";

interface Props {
  rows: Row[];
  tablePresenter: InventoryTablePresenter;
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const InventoryTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as string,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
  const heads = tablePresenter.getColumnHeads().map((column, columnIndex) => {
    const sortParams = tablePresenter
      .getSortableColumnNames()
      .includes(column.apiName)
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
      <Th key={column.displayName} {...sortParams}>
        {column.displayName}
      </Th>
    );
  });

  const [expandedKeys, setExpandedKeys] = useUrlStateWithExpansion({
    route: "Inventory",
  });

  const handleExpansionToggle = (id: string) => () => {
    setExpandedKeys(toggleValueInList(id, expandedKeys));
  };

  React.useEffect(() => {
    setExpandedKeys(
      getIdentitiesForRows(rows).filter((v) => expandedKeys.includes(v))
    );
  }, [`${getIdentitiesForRows(rows)}`]);

  return (
    <TableComposable {...props}>
      <Thead>
        <Tr>
          <Th />
          {heads}
        </Tr>
      </Thead>
      {rows.map((row, index) => (
        <InstanceRow
          index={index}
          key={row.id.full}
          row={row}
          isExpanded={expandedKeys.includes(getIdentityForRow(row))}
          onToggle={handleExpansionToggle(getIdentityForRow(row))}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          actions={tablePresenter.getActionsFor(row.id.full)}
          state={tablePresenter.getStateFor(row.id.full)}
          serviceInstanceIdentifier={{
            id: row.id.full,
            service_entity: row.service_entity,
            version: row.version,
          }}
          shouldUseServiceIdentity={tablePresenter.shouldUseServiceIdentity()}
          idDataLabel={tablePresenter.getIdColumnName()}
        />
      ))}
    </TableComposable>
  );
};

const getIdentityForRow = (row: Row): string => row.id.full;

const getIdentitiesForRows = (rows: Row[]): string[] =>
  rows.map(getIdentityForRow);
