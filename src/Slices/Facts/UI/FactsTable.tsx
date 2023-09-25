import React from "react";
import {
  OnSort,
  Table /* data-codemods */,
  TableVariant,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import styled from "styled-components";
import { Sort } from "@/Core";
import { Fact } from "@S/Facts/Core/Domain";
import { SortKey } from "@S/Facts/Core/Query";
import { FactsRow } from "./FactsRow";
import { FactsTablePresenter } from "./FactsTablePresenter";

interface Props {
  rows: Fact[];
  tablePresenter: FactsTablePresenter;
  sort: Sort.Type<SortKey>;
  setSort: (sort: Sort.Type<SortKey>) => void;
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
      name: tablePresenter.getColumnNameForIndex(index) as SortKey,
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
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>{heads}</Tr>
      </Thead>
      {rows.map((row) => (
        <FactsRow row={row} key={row.id} />
      ))}
    </Table>
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
