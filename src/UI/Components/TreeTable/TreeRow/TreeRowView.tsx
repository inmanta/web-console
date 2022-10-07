import React from "react";
import { Split, SplitItem } from "@patternfly/react-core";
import { Tr, Td } from "@patternfly/react-table";
import { Toggle } from "@/UI/Components/Toggle";
import { ToggleAll } from "../../ToggleAll";
import { CellWithCopy } from "./CellWithCopy";
import { Indent } from "./Indent";
import { TreeRow } from "./TreeRow";

interface RowProps {
  row: TreeRow;
}

export const TreeRowView: React.FC<RowProps> = ({ row }) => {
  switch (row.kind) {
    case "Flat":
      return (
        <Tr aria-label={`Row-${row.id}`}>
          <Td dataLabel={row.primaryCell.label}>
            <Indent level={0} noToggle>
              {row.primaryCell.value}
            </Indent>
          </Td>
          {row.valueCells.map(({ label, value, hasOnClick, serviceName }) => (
            <CellWithCopy
              label={label}
              value={value}
              hasOnClick={hasOnClick}
              serviceName={serviceName}
              className={"pf-m-truncate"}
              key={`${label}-${value}`}
            />
          ))}
        </Tr>
      );
    case "Root":
      return (
        <Tr aria-label={`Row-${row.id}`}>
          <Td dataLabel="name" colSpan={4}>
            <Indent level={0}>
              <Split>
                <SplitItem isFilled>
                  <Toggle
                    expanded={row.isChildExpanded}
                    onToggle={row.onToggle}
                    aria-label={`Toggle-${row.id}`}
                  />
                  {row.primaryCell.value}
                </SplitItem>
                <SplitItem>
                  <ToggleAll
                    isExpanded={false}
                    onToggle={row.openAll}
                    aria-label={`ExpandAll-${row.id}`}
                  />
                  <ToggleAll
                    isExpanded={true}
                    onToggle={row.closeAll}
                    aria-label={`CollapseAll-${row.id}`}
                  />
                </SplitItem>
              </Split>
            </Indent>
          </Td>
        </Tr>
      );

    case "Branch":
      return (
        <Tr aria-label={`Row-${row.id}`} isExpanded={row.isExpandedByParent}>
          <Td colSpan={4} dataLabel={row.primaryCell.label}>
            <Indent level={row.level}>
              <Toggle
                expanded={row.isChildExpanded}
                onToggle={row.onToggle}
                aria-label={`Toggle-${row.id}`}
              />
              {row.primaryCell.value}
            </Indent>
          </Td>
        </Tr>
      );

    case "Leaf":
      return (
        <Tr aria-label={`Row-${row.id}`} isExpanded={row.isExpandedByParent}>
          <Td dataLabel={row.primaryCell.label}>
            <Indent level={row.level} noToggle>
              {row.primaryCell.value}
            </Indent>
          </Td>
          {row.valueCells.map(({ label, value, hasOnClick, serviceName }) => (
            <CellWithCopy
              label={label}
              value={value}
              hasOnClick={hasOnClick}
              serviceName={serviceName}
              className={"pf-m-truncate"}
              key={`${label}-${value}`}
            />
          ))}
        </Tr>
      );
  }
};
