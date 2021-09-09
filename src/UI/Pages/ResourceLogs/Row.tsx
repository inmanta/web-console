import React, { useState } from "react";
import styled, { css } from "styled-components";
import { ResourceLog } from "@/Core";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import { Details } from "./Details";
import moment from "moment";
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from "@patternfly/react-core";
import { CodeText } from "@/UI/Components";

interface Props {
  log: ResourceLog;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

export const Row: React.FC<Props> = ({
  log,
  isExpanded,
  index,
  onToggle,
  numberOfColumns,
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
          <Options />
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
      `;
    case "ERROR":
    case "CRITICAL":
      return css`
        background-color: var(--pf-global--palette--red-50);
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
    .format("DD/MM/YYYY HH:MM:SS");
};

const Options: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems = [
    <DropdownItem key="link">Show messages from this action</DropdownItem>,
  ];

  return (
    <Dropdown
      position={DropdownPosition.right}
      onSelect={() => setIsOpen(false)}
      toggle={
        <StyledKebabToggle
          onToggle={() => setIsOpen(!isOpen)}
          id="toggle-id-6"
        />
      }
      isOpen={isOpen}
      isPlain
      dropdownItems={dropdownItems}
    />
  );
};

const StyledKebabToggle = styled(KebabToggle)`
  padding-top: 0;
  padding-bottom: 0;
`;
