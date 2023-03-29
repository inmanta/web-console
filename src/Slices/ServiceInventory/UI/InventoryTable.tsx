import React from "react";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  OnSort,
} from "@patternfly/react-table";
import { Row, ServiceModel, Sort } from "@/Core";
import { useUrlStateWithExpansion } from "@/Data";
import { InstanceRow } from "./InstanceRow";
import { InventoryTablePresenter } from "./Presenters";

interface Props {
  rows: Row[];
  service?: ServiceModel;
  tablePresenter: InventoryTablePresenter;
  sort: Sort.Type;
  setSort: (sort: Sort.Type) => void;
}

export const InventoryTable: React.FC<Props> = ({
  rows,
  service,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route: "Inventory",
  });
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
          isExpanded={isExpanded(getIdentityForRow(row))}
          onToggle={onExpansion(getIdentityForRow(row))}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
          actions={tablePresenter.getActionsFor(row.id.full)}
          expertActions={tablePresenter.getExpertActionsFor(row.id.full)}
          state={tablePresenter.getStateFor(row.id.full)}
          serviceInstanceIdentifier={{
            id: row.id.full,
            service_entity: row.service_entity,
            version: row.version,
          }}
          shouldUseServiceIdentity={tablePresenter.shouldUseServiceIdentity()}
          idDataLabel={tablePresenter.getIdColumnName()}
          service={service}
        />
      ))}
    </TableComposable>
  );
};

const getIdentityForRow = (row: Row): string => row.id.full;
