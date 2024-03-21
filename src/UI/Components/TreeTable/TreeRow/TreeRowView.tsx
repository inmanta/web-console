import React, { FC } from "react";
import {
  Button,
  Icon,
  Split,
  SplitItem,
  Tooltip,
} from "@patternfly/react-core";
import { ExclamationTriangleIcon, InfoAltIcon } from "@patternfly/react-icons";
import { Tr, Td } from "@patternfly/react-table";
import styled from "styled-components";
import { ParsedNumber, Attributes, AttributeAnnotations } from "@/Core";
import { Toggle } from "@/UI/Components/Toggle";
import { ClipboardCopyButton } from "../../ClipboardCopyButton";
import { CellWithCopy } from "./CellWithCopy";
import { CellWithCopyExpert } from "./CellWithCopyExpert";
import { Indent } from "./Indent";
import { TreeRow } from "./TreeRow";

/**
 * RowProps is an interface that defines the props of the TreeRowView component.
 */
interface RowProps {
  row: TreeRow;
  id: string;
  serviceEntity: string;
  version: ParsedNumber;
  showExpertMode: boolean;
  attributes: Attributes;
  annotations?: AttributeAnnotations;
  setTab?: (tab: string) => void;
}

const warningMessage =
  "This attribute migrated to a different/new Type and can’t be displayed properly into the table. You can copy the object for further comparison through the Copy button. It will store the value of each state in your clipboard.";

/**
 * TreeRowView is a component that renders a row in the tree table for the Attributes.
 *
 * @param {RowProps} props - The props of the component.
 *  @prop {TreeRow} row - The row object.
 *  @prop {string} id - The id of the row.
 *  @prop {string} serviceEntity - The service entity.
 *  @prop {ParsedNumber} version - The version number.
 *  @prop {boolean} showExpertMode - The flag to show the expert mode.
 *  @prop {Attributes} attributes - The attributes object.
 *  @prop {AttributeAnnotations} annotations - The annotations object, optional.
 *  @prop {function} setTab - The callback for setting the active tab, optional.
 *
 * @returns The tree row view component.
 */
export const TreeRowView: React.FC<RowProps> = ({
  row,
  id,
  serviceEntity,
  version,
  showExpertMode,
  attributes,
  annotations,
  setTab = () => {},
}) => {
  switch (row.kind) {
    case "Flat":
      return (
        <StyledTr aria-label={`Row-${row.id}`}>
          <Td dataLabel={row.primaryCell.label}>
            <Indent level={0} noToggle>
              {annotations?.web_presentation !== "documentation" ? (
                row.primaryCell.value
              ) : (
                <DocumentationCell
                  setTab={setTab}
                  value={row.primaryCell.value}
                  tabKey={annotations?.web_title}
                />
              )}
            </Indent>
          </Td>
          {annotations?.web_presentation !== "documentation" &&
            row.valueCells.map(({ label, value, hasRelation, serviceName }) =>
              showExpertMode ? (
                <CellWithCopyExpert
                  label={label}
                  value={
                    label === "description" && value === "null" ? "" : value
                  }
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
                  value={
                    label === "description" && value === "null" ? "" : value
                  }
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

/**
 * DocumentationCellProps is an interface that defines the props of the DocumentationCell component.
 */
interface DocumentationCellProps {
  value: string;
  tabKey: string | undefined;
  setTab: (tab: string) => void;
}

/**
 * DocumentationCell is a component that renders a cell with a documentation button.
 * This is meant to display attributes that are forwarding to a documentation tab.
 *
 * @param {DocumentationCellProps} props - The props of the component.
 *  @prop {string} value - The value of the cell.
 *  @prop {string} tabKey - The key of the tab.
 *  @prop {function} setTab - The callback for setting the active tab.
 *
 * @returns The documentation cell component.
 */
const DocumentationCell: FC<DocumentationCellProps> = ({
  value,
  tabKey = "",
  setTab,
}) => (
  <Button
    variant="link"
    icon={<InfoAltIcon />}
    isInline
    title={value}
    onClick={() => setTab(tabKey)}
  >
    {value}
  </Button>
);

const Spacer = styled.span`
  padding-left: 10px;
`;

const StyledTr = styled(Tr)`
  > * {
    --pf-v5-c-table--cell--FontSize: 16px;
  }
`;
