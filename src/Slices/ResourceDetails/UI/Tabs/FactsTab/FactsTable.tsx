import React, { useEffect, useState } from "react";
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import styled from "styled-components";
import { Sort } from "@/Core";
import { Order } from "@/Core/Domain/Sort";
import { ColumnHead } from "@/UI/Presenters";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";

type FactRow = Pick<Fact, "id" | "name" | "updated" | "value">;

interface Props {
  facts: FactRow[];
}

const factsColumnHeads: ColumnHead[] = [
  { apiName: "name", displayName: words("resources.facts.columns.name") },
  { apiName: "updated", displayName: words("resources.facts.columns.updated") },
  { apiName: "value", displayName: words("resources.facts.columns.value") },
];

export const FactsTable: React.FC<Props> = ({ facts }) => {
  const [sort, setSort] = useState<Sort.Type>({ name: "name", order: "asc" });
  const [rows, setRows] = useState(sortFactRows(facts, sort.name, sort.order));
  const onSort = (event, index, direction) => {
    const updatedSortColumn = indexToColumnName(index);
    setSort({ name: updatedSortColumn, order: direction });
    const updatedRows = sortFactRows(rows, updatedSortColumn, direction);
    setRows(updatedRows);
  };

  // Ensure that the table is updated with new facts
  useEffect(() => {
    setRows(sortFactRows(facts, sort.name, sort.order));
  }, [facts, sort]);

  return (
    <TableComposable variant="compact" aria-label="Facts-Success">
      <Thead>
        <Tr>
          {factsColumnHeads.map(({ displayName }, idx) => (
            <Th
              key={displayName}
              sort={{
                sortBy: {
                  index: columnNameToIndex(sort.name),
                  direction: sort.order,
                  defaultDirection: "asc",
                },
                columnIndex: idx,
                onSort,
              }}
            >
              {displayName}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((fact) => (
          <Tr key={fact.id} aria-label="Facts table row">
            <NameCell chars={fact.name.length}>{fact.name}</NameCell>
            <DateCell>
              {fact.updated && new MomentDatePresenter().getFull(fact.updated)}
            </DateCell>
            <Td>{fact.value}</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

const DateCell = styled(Td)`
  --pf-c-table--cell--Width: 20ch;
`;

const NameCell = styled(Td)<{ chars: number }>`
  --pf-c-table--cell--Width: calc(${(p) => p.chars}ch + 40px);
  --pf-c-table--cell--MinWidth: 120px;
`;

function indexToColumnName(index: number): string {
  const columns = factsColumnHeads.map((head) => head.apiName);
  return columns[index];
}

function columnNameToIndex(columnName: string): number {
  const columns = factsColumnHeads.map((head) => head.apiName);
  return columns.indexOf(columnName);
}

export function sortFactRows(
  rows: FactRow[],
  columnName: string,
  direction: Order
): FactRow[] {
  return rows.sort((a: FactRow, b: FactRow) => {
    // sort by date
    if (columnName === "updated") {
      const aDate = coalesceDateToMin(a[columnName]);
      const bDate = coalesceDateToMin(b[columnName]);
      if (direction === "asc") {
        return aDate - bDate;
      }
      return bDate - aDate;
    } else {
      const aValue = a[columnName];
      const bValue = b[columnName];
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    }
  });
}

function coalesceDateToMin(date?: string) {
  const definedDate = date ? date : 0;
  return new Date(definedDate).getTime();
}
