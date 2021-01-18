import React from "react";
import {
  TableComposable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ExpandableRowContent,
} from "@patternfly/react-table";
import { fromEntries } from "Core";

export const ComposableTableExpandable: React.FC = () => {
  const columns = [
    "Repositories",
    "Branches",
    "Pull requests",
    "Workspaces",
    "Last commit",
  ];
  const rowPairs = [
    { parent: ["one", "two", "a", "four", "five"], child: null },
    {
      parent: ["parent 1", "two", "k", "four", "five"],
      child: ["single cell"],
    },
    {
      parent: ["parent 2", "two", "b", "four", "five"],
      child: ["single cell - fullWidth"],
      fullWidth: true,
    },
    {
      parent: ["parent 3", "2", "b", "four", "five"],
      child: ["single cell - noPadding"],
      noPadding: true,
    },
    {
      parent: ["parent 4", "2", "b", "four", "five"],
      child: ["single cell - fullWidth & noPadding"],
      fullWidth: true,
      noPadding: true,
    },
    {
      parent: ["parent 5", "2", "b", "four", "five"],
      child: [
        "spans 'Repositories' and 'Branches'",
        "spans 'Pull requests' and 'Workspaces', and 'Last commit'",
      ],
    },
    {
      parent: ["parent 6", "2", "b", "four", "five"],
      child: [
        "fullWidth, spans the collapsible column and 'Repositories'",
        "fullWidth, spans 'Branches' and 'Pull requests'",
        "fullWidth, spans 'Workspaces' and 'Last commit'",
      ],
      fullWidth: true,
    },
  ];
  const numColumns = columns.length;
  // Init all to true
  const [expanded, setExpanded] = React.useState(
    fromEntries(Object.entries(rowPairs).map(([k, v]) => [k, Boolean(v.child)]))
  );
  const handleExpansionToggle = (event, pairIndex) => {
    setExpanded({
      ...expanded,
      [pairIndex]: !expanded[pairIndex],
    });
  };
  let rowIndex = -1;
  return (
    <TableComposable aria-label="Expandable Table">
      <Thead>
        <Tr>
          <Th />
          <Th>{columns[0]}</Th>
          <Th>{columns[1]}</Th>
          <Th>{columns[2]}</Th>
          <Th>{columns[3]}</Th>
          <Th>{columns[4]}</Th>
        </Tr>
      </Thead>
      {rowPairs.map((pair, pairIndex) => {
        rowIndex += 1;
        const parentRow = (
          <Tr key={rowIndex}>
            <Td
              key={`${rowIndex}_0`}
              expand={
                pair.child
                  ? {
                      rowIndex: pairIndex,
                      isExpanded: expanded[pairIndex],
                      onToggle: handleExpansionToggle,
                    }
                  : undefined
              }
            />
            {pair.parent.map((cell, cellIndex) => (
              <Td
                key={`${rowIndex}_${cellIndex}`}
                dataLabel={columns[cellIndex]}
              >
                {cell}
              </Td>
            ))}
          </Tr>
        );
        if (pair.child) {
          rowIndex += 1;
        }
        const childRow = pair.child ? (
          <Tr key={rowIndex} isExpanded={expanded[pairIndex] === true}>
            {!rowPairs[pairIndex].fullWidth && <Td key={`${rowIndex}_0`} />}
            {pair.child.map((cell, cellIndex) => {
              const numChildCells = pair.child.length;
              const shift = rowPairs[pairIndex].fullWidth ? 1 : 0;
              const shiftedCellIndex = cellIndex + shift;
              // some examples of how you could customize colSpan based on your needs
              const getColSpan = () => {
                // we have 6 columns (1 expandable column + 5 regular columns)
                // for the rowPairs where we've specificed `fullWidth`, add +1 to account for the expandable column
                let colSpan = 1;
                if (numChildCells === 1) {
                  // single child cell: take up full width
                  colSpan = numColumns + shift;
                } else if (numChildCells === 2) {
                  // 2 children
                  // child 1: 2 colspan
                  // child 2: 3 or 4 colspan depending on fullWidth
                  colSpan = cellIndex === 0 ? 2 : 3 + shift;
                } else if (numChildCells === 3) {
                  // 3 children
                  // child 1: 2 colspam
                  // child 2: 2 colspan
                  // child 3: 1 or 2 colspan depending on fullWidth
                  colSpan = cellIndex === 2 ? 1 + shift : 2;
                }
                return colSpan;
              };
              return (
                <Td
                  key={`${rowIndex}_${shiftedCellIndex}`}
                  dataLabel={columns[cellIndex]}
                  noPadding={rowPairs[pairIndex].noPadding}
                  colSpan={getColSpan()}
                >
                  <ExpandableRowContent>{cell}</ExpandableRowContent>
                </Td>
              );
            })}
          </Tr>
        ) : null;
        return (
          <Tbody key={pairIndex} isExpanded={expanded[pairIndex] === true}>
            {parentRow}
            {childRow}
          </Tbody>
        );
      })}
    </TableComposable>
  );
};
