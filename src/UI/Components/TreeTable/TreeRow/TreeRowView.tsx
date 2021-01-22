import React from "react";
import { Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { TreeRow } from "./TreeRow";
import { Toggle } from "@/UI/Components";

interface IndentProps {
  level: number;
  noToggle?: boolean;
}

const Indent: React.FC<IndentProps> = ({ level, children, noToggle }) => {
  const space = level * 16 + (noToggle ? 48 : 0);
  return <span style={{ marginLeft: `${space}px` }}>{children}</span>;
};

const CustomTd = styled(Td)`
  --pf-c-table--cell--PaddingTop: 24px;
  --pf-c-table--cell--PaddingBottom: 24px;
`;

interface RowProps {
  row: TreeRow;
}

export const TreeRowView: React.FC<RowProps> = ({ row }) => {
  switch (row.kind) {
    case "Flat":
      return (
        <Tr>
          <Td dataLabel={row.cell.label}>
            <Indent level={0} noToggle>
              {row.cell.value}
            </Indent>
          </Td>
          {row.cells.map(({ label, value }) => (
            <Td key={label} dataLabel={label}>
              {value}
            </Td>
          ))}
        </Tr>
      );
    case "Root":
      return (
        <Tr>
          <Td dataLabel="name" colSpan={4}>
            <Indent level={0}>
              <Toggle expanded={row.isChildExpanded} onToggle={row.onToggle} />
              {row.cell.value}
            </Indent>
          </Td>
        </Tr>
      );

    case "Branch":
      return (
        <Tr isExpanded={row.isExpandedByParent}>
          <CustomTd colSpan={4} dataLabel={row.cell.label}>
            <Indent level={row.level}>
              <Toggle expanded={row.isChildExpanded} onToggle={row.onToggle} />
              {row.cell.value}
            </Indent>
          </CustomTd>
        </Tr>
      );

    case "Leaf":
      return (
        <Tr isExpanded={row.isExpandedByParent}>
          <CustomTd dataLabel={row.cell.label}>
            <Indent level={row.level} noToggle>
              {row.cell.value}
            </Indent>
          </CustomTd>
          {row.cells.map(({ label, value }) => (
            <Td key={label} dataLabel={label}>
              {value}
            </Td>
          ))}
        </Tr>
      );
  }
};
