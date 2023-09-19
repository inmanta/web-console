import React from "react";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import styled, { css } from "styled-components";
import { CodeText } from "@/UI/Components";
import { MomentDatePresenter } from "@/UI/Utils";
import { ResourceLog } from "@S/ResourceDetails/Core/ResourceLog";
import { Details } from "./Details";
import { RowOptions, ToggleActionType } from "./RowOptions";

interface Props {
  log: ResourceLog;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
  toggleActionType: ToggleActionType;
}

const datePresenter = new MomentDatePresenter();

export const Row: React.FC<Props> = ({
  log,
  isExpanded,
  index,
  onToggle,
  numberOfColumns,
  toggleActionType,
}) => {
  return (
    <StyledTbody
      isExpanded={false}
      $level={log.level}
      aria-label="ResourceLogRow"
    >
      <Tr>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        {/* The width values represent percentages */}
        <Td width={15}>{datePresenter.getFull(log.timestamp)}</Td>
        <Td width={10}>{log.action}</Td>
        <Td width={10}>{log.level}</Td>
        <Td modifier="truncate">
          <CodeText singleLine>{log.msg}</CodeText>
        </Td>
        <Td isActionCell>
          <RowOptions toggleActionType={toggleActionType} action={log.action} />
        </Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <Details log={log} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </StyledTbody>
  );
};

const StyledTbody = styled(Tbody)<{ $level: string }>`
  ${(p) => getStyleForLevel(p.$level)};
`;

const getStyleForLevel = (level: string) => {
  switch (level) {
    case "WARNING":
      return css`
        background-color: var(--pf-v5-global--palette--gold-50);
        --pf-v5-c-table__expandable-row--after--BorderColor: var(
          --pf-v5-global--palette--gold-100
        );
      `;
    case "ERROR":
    case "CRITICAL":
      return css`
        background-color: var(--pf-v5-global--palette--red-50);
        --pf-v5-c-table__expandable-row--after--BorderColor: var(
          --pf-v5-global--palette--red-100
        );
      `;
    default:
      return "";
  }
};
