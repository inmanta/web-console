import React from "react";
import styled, { css } from "styled-components";
import { ResourceLog } from "@/Core";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import { Details } from "./Details";
import moment from "moment";
import { CodeText } from "@/UI/Components";
import { RowOptions, ToggleActionType } from "./RowOptions";

interface Props {
  log: ResourceLog;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
  toggleActionType: ToggleActionType;
}

export const Row: React.FC<Props> = ({
  log,
  isExpanded,
  index,
  onToggle,
  numberOfColumns,
  toggleActionType,
}) => {
  return (
    <StyledTbody isExpanded={false} $level={log.level}>
      <Tr>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td>{presentDate(log.timestamp)}</Td>
        <Td>{log.action}</Td>
        <Td>{log.level}</Td>
        <Td>
          <CodeText singleLine>{presentShortMessage(log.msg)}</CodeText>
        </Td>
        <Td>
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
        background-color: var(--pf-global--palette--gold-50);
        --pf-c-table__expandable-row--after--BorderColor: var(
          --pf-global--palette--gold-100
        );
      `;
    case "ERROR":
    case "CRITICAL":
      return css`
        background-color: var(--pf-global--palette--red-50);
        --pf-c-table__expandable-row--after--BorderColor: var(
          --pf-global--palette--red-100
        );
      `;
    default:
      return "";
  }
};

const presentShortMessage = (message: string): string =>
  message.length <= 40 ? message : message.slice(0, 40) + "...";

const presentDate = (timestamp: string): string => {
  return moment
    .utc(timestamp)
    .tz(moment.tz.guess())
    .format("DD/MM/YYYY HH:mm:ss.SSS");
};
