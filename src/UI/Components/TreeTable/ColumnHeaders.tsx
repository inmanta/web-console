import React, { useState } from "react";
import { Button } from "@patternfly/react-core";
import { Th } from "@patternfly/react-table";
import styled from "styled-components";
import { ColumnExpansionHelper } from "./Helpers";

interface Props {
  columns: string[];
  emptyColumns: string[];
}

export const ColumnHeaders: React.FC<Props> = ({ columns, emptyColumns }) => {
  const columnExpansionHelper = new ColumnExpansionHelper(
    60,
    columns.length,
    10
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columnExpansionHelper.getDefaultState(columns, emptyColumns)
  );
  return (
    <>
      {columns.map((column) => (
        <ColumnHeader
          key={column}
          column={column}
          width={columnWidths[column]}
          onClick={() =>
            columnExpansionHelper.isExpanded(columnWidths[column])
              ? setColumnWidths(
                  columnExpansionHelper.getDefaultState(columns, emptyColumns)
                )
              : setColumnWidths(
                  columnExpansionHelper.expandColumn(columnWidths, column)
                )
          }
        />
      ))}
    </>
  );
};

interface SingleHeaderProps {
  column: string;
  width: number;
  onClick: () => void;
}

const ColumnHeader: React.FC<SingleHeaderProps> = ({
  column,
  width,
  onClick,
}) => (
  <StyledHeader key={column} $width={width}>
    <StyledButton variant="plain" onClick={onClick}>
      {column}
    </StyledButton>
  </StyledHeader>
);

const StyledButton = styled(Button)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: no-wrap;
  width: 100%;
`;

const StyledHeader = styled(Th)<{
  $width: number;
}>`
  ${({ $width }) =>
    `&& {
    width: ${$width}%;
  }`}
`;
