import React, { useEffect, useState } from "react";
import { Table, Th, Thead, Tr } from "@patternfly/react-table";
import { Sort, WordKey, words } from "@/Core";
import { Order } from "@/Core/Domain/Sort";
import { useClassifiedRows } from "@/UI/Components/AttributeList";
import { Fact } from "@S/Facts/Core/Domain";
import { FactsRow } from "./FactsRow";

type FactRow = Pick<Fact, "id" | "name" | "updated" | "value">;

interface Props {
  facts: FactRow[];
}

const FACTS_COLUMNS = [
  { apiName: "name", labelKey: "name" },
  { apiName: "updated", labelKey: "lastUpdated" },
  { apiName: "value", labelKey: "value" },
] satisfies { apiName: string; labelKey: WordKey }[];

export const FactsTable: React.FC<Props> = ({ facts }) => {
  const [sort, setSort] = useState<Sort.Type>({ name: "name", order: "asc" });
  const [rows, setRows] = useState(sortFactRows(facts, sort.name, sort.order));
  const { classifiedRows, hasExpandableRows } = useClassifiedRows(rows);
  const numberOfColumns = FACTS_COLUMNS.length + (hasExpandableRows ? 1 : 0);
  const onSort = (_event, index, direction) => {
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
    <Table variant="compact" aria-label="Facts-Success" isStickyHeader>
      <Thead>
        <Tr>
          {hasExpandableRows && <Th screenReaderText="Row expansion" />}
          {FACTS_COLUMNS.map(({ apiName, labelKey }, idx) => (
            <Th
              key={apiName}
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
              {words(labelKey)}
            </Th>
          ))}
        </Tr>
      </Thead>
      {classifiedRows.map(({ row, attribute }, rowIndex) => (
        <FactsRow
          row={row}
          attribute={attribute}
          key={row.id}
          rowIndex={rowIndex}
          numberOfColumns={numberOfColumns}
          showExpandColumn={hasExpandableRows}
        />
      ))}
    </Table>
  );
};

function indexToColumnName(index: number): string {
  const columns = FACTS_COLUMNS.map((column) => column.apiName);

  return columns[index];
}

function columnNameToIndex(columnName: string): number {
  const columns = FACTS_COLUMNS.map((column) => column.apiName);

  return columns.indexOf(columnName);
}

export function sortFactRows(rows: FactRow[], columnName: string, direction: Order): FactRow[] {
  return [...rows].sort((a: FactRow, b: FactRow) => {
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
