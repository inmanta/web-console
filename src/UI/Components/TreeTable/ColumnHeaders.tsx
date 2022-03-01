import React, { useState } from "react";
import { Button } from "@patternfly/react-core";
import { CaretLeftIcon, CaretRightIcon } from "@patternfly/react-icons";
import { Th, ThProps } from "@patternfly/react-table";
import styled from "styled-components";
import { ColumnExpansionHelper } from "./Helpers";

interface Props {
  columns: string[];
}

export const ColumnHeaders: React.FC<Props> = ({ columns }) => {
  const columnExpansionHelper = new ColumnExpansionHelper(
    60,
    columns.length,
    10
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    columnExpansionHelper.getDefaultState(columns)
  );
  return (
    <>
      {columns.map((column) => (
        <ColumnHeader
          key={column}
          column={column}
          width={columnWidths[column]}
          minWidth={columnExpansionHelper.getMinColumnWidth()}
          maxWidth={columnExpansionHelper.getMaxColumnWidth()}
          collapseColumn={() =>
            setColumnWidths(
              columnExpansionHelper.collapseColumn(columnWidths, column)
            )
          }
          expandColumn={() =>
            setColumnWidths(
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
  minWidth: number;
  maxWidth: number;
  collapseColumn: () => void;
  expandColumn: () => void;
}

const ColumnHeader: React.FC<SingleHeaderProps> = ({
  column,
  width,
  minWidth,
  maxWidth,
  collapseColumn,
  expandColumn,
}) => (
  <Th key={column} {...({ width: width } as Pick<ThProps, "width">)}>
    {column}
    <CollapseButton
      isVisible={width !== minWidth}
      collapseColumn={collapseColumn}
    />
    <ExpandButton isVisible={width !== maxWidth} expandColumn={expandColumn} />
  </Th>
);

const CollapseButton: React.FC<{
  isVisible: boolean;
  collapseColumn: () => void;
}> = ({ isVisible, collapseColumn }) =>
  isVisible ? (
    <SmallButton variant="plain" onClick={collapseColumn} isSmall>
      <CaretLeftIcon />
    </SmallButton>
  ) : null;

const ExpandButton: React.FC<{
  isVisible: boolean;
  expandColumn: () => void;
}> = ({ isVisible, expandColumn }) =>
  isVisible ? (
    <SmallButton variant="plain" onClick={expandColumn} isSmall>
      <CaretRightIcon />
    </SmallButton>
  ) : null;

const SmallButton = styled(Button)`
  padding-left: 6px;
  padding-right: 6px;
`;
