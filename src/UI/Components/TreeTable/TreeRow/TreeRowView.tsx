import React from "react";
import { Icon, Split, SplitItem, Tooltip } from "@patternfly/react-core";
import { ExclamationTriangleIcon } from "@patternfly/react-icons";
import { Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { ParsedNumber, Attributes } from "@/Core";
import { Toggle } from "@/UI/Components/Toggle";
import { ClipboardCopyButton } from "../../ClipboardCopyButton";
import { CellWithCopy } from "./CellWithCopy";
import { CellWithCopyExpert } from "./CellWithCopyExpert";
import { Indent } from "./Indent";
import { TreeRow } from "./TreeRow";

interface RowProps {
  row: TreeRow;
  id: string;
  serviceEntity: string;
  version: ParsedNumber;
  showExpertMode: boolean;
  attributes: Attributes;
}

const warningMessage =
  "This attribute migrated to a different/new Type and can’t be displayed properly into the table. You can copy the object for further comparison through the Copy button. It will store the value of each state in your clipboard.";

export const TreeRowView: React.FC<RowProps> = ({
  row,
  id,
  serviceEntity,
  version,
  showExpertMode,
  attributes,
}) => {
  switch (row.kind) {
    case "Flat":
      return (
        <StyledTr aria-label={`Row-${row.id}`}>
          <Td dataLabel={row.primaryCell.label}>
            <Indent level={0} noToggle>
              {row.primaryCell.value}
            </Indent>
          </Td>
          {row.valueCells.map(({ label, value, hasRelation, serviceName }) =>
            showExpertMode ? (
              <CellWithCopyExpert
                label={label}
                value={label === "description" && value === "null" ? "" : value}
                hasRelation={hasRelation}
                serviceName={serviceName}
                className={"pf-v5-m-truncate"}
                key={`${label}-${value}-expert`}
                path={row.id}
                instanceId={id}
                version={version}
                serviceEntity={serviceEntity}
                attributeType={row.type ? row.type : "undefined"}
                parentObject={null}
              />
            ) : (
              <CellWithCopy
                label={label}
                value={label === "description" && value === "null" ? "" : value}
                hasRelation={hasRelation}
                serviceName={serviceName}
                className={"pf-v5-m-truncate"}
                key={`${label}-${value}`}
              />
            ),
          )}
        </StyledTr>
      );
    case "Root":
      return (
        <StyledTr aria-label={`Row-${row.id}`}>
          <Td dataLabel="name" colSpan={4}>
            <Indent level={0}>
              <Split>
                <SplitItem isFilled>
                  <Toggle
                    expanded={row.isChildExpanded}
                    onToggle={row.onToggle}
                    aria-label={`Toggle-${row.id}`}
                  />
                  {row.primaryCell.label === "description" &&
                  row.primaryCell.value === "null"
                    ? ""
                    : row.primaryCell.value}
                  {row.primaryCell.warning ? (
                    <Spacer>
                      <Tooltip content={warningMessage}>
                        <Icon status="warning">
                          <ExclamationTriangleIcon />
                        </Icon>
                      </Tooltip>
                      <ClipboardCopyButton
                        value={row.primaryCell.warning}
                      ></ClipboardCopyButton>
                    </Spacer>
                  ) : (
                    ""
                  )}
                </SplitItem>
              </Split>
            </Indent>
          </Td>
        </StyledTr>
      );

    case "Branch":
      return (
        <StyledTr
          aria-label={`Row-${row.id}`}
          isExpanded={row.isExpandedByParent}
        >
          <Td colSpan={4} dataLabel={row.primaryCell.label}>
            <Indent level={row.level}>
              <Toggle
                expanded={row.isChildExpanded}
                onToggle={row.onToggle}
                aria-label={`Toggle-${row.id}`}
              />
              {row.primaryCell.label === "description" &&
              row.primaryCell.value === "null"
                ? ""
                : row.primaryCell.value}
              {row.primaryCell.warning ? (
                <Spacer>
                  <Tooltip content={warningMessage}>
                    <Icon status="warning">
                      <ExclamationTriangleIcon />
                    </Icon>
                  </Tooltip>
                  <ClipboardCopyButton
                    value={row.primaryCell.warning}
                  ></ClipboardCopyButton>
                </Spacer>
              ) : (
                ""
              )}
            </Indent>
          </Td>
        </StyledTr>
      );

    case "Leaf":
      return (
        <StyledTr
          aria-label={`Row-${row.id}`}
          isExpanded={row.isExpandedByParent}
        >
          <Td dataLabel={row.primaryCell.label}>
            <Indent level={row.level} noToggle>
              {row.primaryCell.value}
            </Indent>
          </Td>
          {row.valueCells.map(({ label, value, hasRelation, serviceName }) =>
            showExpertMode ? (
              <CellWithCopyExpert
                label={label}
                value={label === "description" && value === "null" ? "" : value}
                hasRelation={hasRelation}
                serviceName={serviceName}
                className={"pf-v5-m-truncate"}
                key={`${label}-${value}-expert`}
                path={row.id}
                instanceId={id}
                version={version}
                serviceEntity={serviceEntity}
                attributeType={row.type ? row.type : "undefined"}
                parentObject={attributes[label]}
              />
            ) : (
              <CellWithCopy
                label={label}
                value={label === "description" && value === "null" ? "" : value}
                hasRelation={hasRelation}
                serviceName={serviceName}
                className={"pf-v5-m-truncate"}
                key={`${label}-${value}`}
              />
            ),
          )}
        </StyledTr>
      );
  }
};

const Spacer = styled.span`
  padding-left: 10px;
`;

const StyledTr = styled(Tr)`
  > * {
    --pf-v5-c-table--cell--FontSize: 16px;
  }
`;
