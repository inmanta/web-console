import React from "react";
import {
  OnSort,
  TableComposable,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import styled from "styled-components";
import { Resource, Sort } from "@/Core";
import { useExpansion } from "@/Data";
import { ResourceTableRow } from "./ResourceTableRow";
import { ResourcesTablePresenter } from "./ResourcesTablePresenter";

interface Props {
  rows: Resource.Row[];
  tablePresenter: ResourcesTablePresenter;
  sort: Sort.Type<Resource.SortKey>;
  setSort: (sort: Sort.Type<Resource.SortKey>) => void;
}
export const ResourcesTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const [isExpanded, onExpansion] = useExpansion();
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as Resource.SortKey,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
  const heads = tablePresenter
    .getColumnHeads()
    .map(({ apiName, displayName }, columnIndex) => {
      const hasSort = tablePresenter.getSortableColumnNames().includes(apiName);
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
        <StyledTh
          key={displayName}
          {...sortParams}
          $characters={displayName.length}
          $hasSort={hasSort}
        >
          {displayName}
        </StyledTh>
      );
    });

  return (
    <TableComposable {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          <Th></Th>
          {heads}
        </Tr>
      </Thead>
      {rows.map((row) => (
        <ResourceTableRow
          row={row}
          key={row.id}
          isExpanded={isExpanded(row.id)}
          onToggle={onExpansion(row.id)}
          numberOfColumns={tablePresenter.getNumberOfColumns()}
        />
      ))}
    </TableComposable>
  );
};

interface HeaderProps {
  $characters: number;
  $hasSort: boolean;
}

const getWidth = ({ $characters, $hasSort }: HeaderProps) => {
  const base = `${$characters}ch`;
  const extra = $hasSort ? "60px" : "16px";
  return `calc(${base} + ${extra})`;
};

const StyledTh = styled(Th)<HeaderProps>`
  &&& {
    min-width: ${getWidth};
  }
`;
