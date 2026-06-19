import React from "react";
import { OnSort, Table, TableVariant, Th, Thead, Tr } from "@patternfly/react-table";
import { Sort } from "@/Core";
import { AttributeClassifier } from "@/Data";
import { SortKey } from "@/Slices/Facts/Core/Types";
import { isEditorKind } from "@/UI/Components";
import { Fact } from "@S/Facts/Core/Domain";
import { FactsRow } from "./FactsRow";
import { FactsTablePresenter } from "./FactsTablePresenter";

const classifier = new AttributeClassifier();

interface Props {
  rows: Fact[];
  tablePresenter: FactsTablePresenter;
  sort: Sort.Type<SortKey>;
  setSort: (sort: Sort.Type<SortKey>) => void;
}

export const FactsTable: React.FC<Props> = ({ rows, tablePresenter, sort, setSort, ...props }) => {
  const onSort: OnSort = (_event, index, order) => {
    setSort({
      name: tablePresenter.getColumnNameForIndex(index) as SortKey,
      order,
    });
  };
  const activeSortIndex = tablePresenter.getIndexForColumnName(sort.name);
  const classifiedRows = rows.map((row) => ({
    row,
    attribute: classifier.classify({ value: row.value })[0],
  }));
  const hasExpandableRows = classifiedRows.some(({ attribute }) => isEditorKind(attribute.kind));
  const numberOfColumns = tablePresenter.getNumberOfColumns() + (hasExpandableRows ? 1 : 0);
  const heads = tablePresenter.getColumnHeads().map(({ apiName, displayName }, columnIndex) => {
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
      <Th key={displayName} {...sortParams} modifier="nowrap">
        {displayName}
      </Th>
    );
  });

  return (
    <Table {...props} variant={TableVariant.compact}>
      <Thead>
        <Tr>
          {hasExpandableRows && <Th screenReaderText="Row expansion" />}
          {heads}
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
