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
import { Fact, GetFacts, Sort } from "@/Core";
import { FactsRow } from "./FactsRow";
import { FactsTablePresenter } from "./FactsTablePresenter";

interface Props {
  rows: Fact[];
  tablePresenter: FactsTablePresenter;
  sort: Sort.Type<GetFacts.SortKey>;
  setSort: (sort: Sort.Type<GetFacts.SortKey>) => void;
}
export const FactsTable: React.FC<Props> = ({
  rows,
  tablePresenter,
  sort,
  setSort,
  ...props
}) => {
  const onSort: OnSort = (event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as GetFacts.SortKey,
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
        <Tr>{heads}</Tr>
      </Thead>
      {rows.map((row) => (
        <FactsRow row={row} key={row.id} />
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
