import React, { useState } from "react";
import { ArrowsAltHIcon, CompressAltIcon } from "@patternfly/react-icons";
import { Th } from "@patternfly/react-table";
import { isEqual } from "lodash-es";
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
          isExpandable={!columnExpansionHelper.isExpanded(columnWidths[column])}
          isCollapsible={
            columnExpansionHelper.isExpanded(columnWidths[column]) &&
            !isEqual(
              columnWidths,
              columnExpansionHelper.getDefaultState(columns, emptyColumns),
            )
          }
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
  isExpandable: boolean;
  isCollapsible: boolean;
  onClick: () => void;
}

const ColumnHeader: React.FC<SingleHeaderProps> = ({
  column,
  width,
  isExpandable,
  isCollapsible,
  onClick,
}) => (
  <StyledHeader key={column} $width={width} className="pf-v5-c-table__sort">
    <button onClick={onClick} className="pf-v5-c-table__button">
      <div className="pf-v5-c-table__button-content">
        <span className="pf-v5-c-table__text">{column}</span>
        <span className="pf-v5-c-table__sort-indicator">
          {isExpandable && <ArrowsAltHIcon />}
          {isCollapsible && <HorizontalCompressIcon />}
        </span>
      </div>
    </button>
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
