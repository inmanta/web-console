import React from "react";
import { Tbody, Tr, Td, ExpandableRowContent } from "@patternfly/react-table";
import { Resource } from "@/Core";
import {
  labelColorConfig,
  ResourceLink,
  ResourceStatusLabel,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { RequiresTableWithData } from "./Components";

interface Props {
  row: Resource.Row;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

export const ResourceTableRow: React.FC<Props> = ({
  row,
  isExpanded,
  onToggle,
  numberOfColumns,
  index,
}) => (
  <Tbody>
    <Tr aria-label="Resource Table Row">
      <Td
        style={{ width: "0%" }} // This is to enforce the same width when there is no expandable content.
        aria-label={`Toggle-${row.id}${row.numberOfDependencies <= 0 ? "-hidden" : ""}`}
        expand={
          row.numberOfDependencies > 0
            ? {
                rowIndex: index,
                isExpanded: isExpanded,
                onToggle: onToggle,
              }
            : undefined
        }
      ></Td>
      <Td dataLabel={words("resources.column.type")}>{row.type}</Td>
      <Td dataLabel={words("resources.column.agent")}>{row.agent}</Td>
      <Td dataLabel={words("resources.column.value")}>{row.value}</Td>
      <Td dataLabel={words("resources.column.requires")}>
        {row.numberOfDependencies as React.ReactNode}
      </Td>
      <Td dataLabel={words("resources.column.deployState")}>
        <ResourceStatusLabel
          status={labelColorConfig[row.deployState]}
          label={row.deployState}
        />
      </Td>
      <Td isActionCell>
        <ResourceLink
          resourceId={row.id}
          linkText={words("resources.link.details")}
        />
      </Td>
    </Tr>
    {isExpanded && (
      <Tr isExpanded={isExpanded}>
        <Td colSpan={numberOfColumns}>
          <ExpandableRowContent>
            <RequiresTableWithData
              id={row.id}
              deps={row.numberOfDependencies as number}
            />
          </ExpandableRowContent>
        </Td>
      </Tr>
    )}
  </Tbody>
);
