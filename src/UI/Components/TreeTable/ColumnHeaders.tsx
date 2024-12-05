import React, { useState } from "react";
import { Button } from "@patternfly/react-core";
import { ArrowsAltHIcon, CompressAltIcon } from "@patternfly/react-icons";
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
    10,
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columnExpansionHelper.getDefaultState(columns, emptyColumns),
  );

  return (
    <>
      {columns.map((column) => (
        <ColumnHeader
          key={column}
          column={column}
          width={columnWidths[column]}
          isExpanded={!columnExpansionHelper.isExpanded(columnWidths[column])}
          onClick={() =>
            columnExpansionHelper.isExpanded(columnWidths[column])
              ? setColumnWidths(
                  columnExpansionHelper.getDefaultState(columns, emptyColumns),
                )
              : setColumnWidths(
                  columnExpansionHelper.expandColumn(columnWidths, column),
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
  isExpanded: boolean; // Expands in the horizaontal direction (stretching/shrinking the width's content)
  onClick: () => void;
}

const ColumnHeader: React.FC<SingleHeaderProps> = ({
  column,
  width,
  isExpanded,
  onClick,
}) => (
  <StyledHeader key={column} $width={width}>
    <Button
      variant="control"
      onClick={onClick}
      icon={isExpanded ? <ArrowsAltHIcon /> : <HorizontalCompressIcon />}
    >
      {column}
    </Button>
  </StyledHeader>
);

const HorizontalCompressIcon = styled(CompressAltIcon)`
  transform: rotate(45deg);
  vertical-align: -0.125em;
`;

const StyledHeader = styled(Th)<{
  $width: number;
}>`
  ${({ $width }) =>
    `&& {
    width: ${$width}%;
  }`}
`;
