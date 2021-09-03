import React, { useState } from "react";
import { ResourceAction } from "@/Core";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import { Details } from "./Details";
import moment from "moment";

interface Props {
  action: ResourceAction;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

export const Row: React.FC<Props> = ({
  action,
  isExpanded,
  index,
  onToggle,
  numberOfColumns,
}) => {
  return (
    <Tbody isExpanded={false}>
      <Tr>
        <Td
          expand={{
            rowIndex: index,
            isExpanded,
            onToggle,
          }}
        />
        <Td>{presentDate(action.messages[0].timestamp)}</Td>
        <Td>{action.action}</Td>
        <Td>{action.messages[0].level}</Td>
        <Td>{presentShortMessage(action.messages[0].msg)}</Td>
        <Td>
          <Options />
        </Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <Details action={action} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

const presentShortMessage = (message: string): string =>
  message.length <= 40 ? message : message.slice(0, 40) + "...";

const presentDate = (timestamp: string): string => {
  return moment
    .utc(timestamp)
    .tz(moment.tz.guess())
    .format("DD/MM/YYYY HH:MM:SS");
};

import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  KebabToggle,
} from "@patternfly/react-core";

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
        <KebabToggle onToggle={() => setIsOpen(!isOpen)} id="toggle-id-6" />
      }
      isOpen={isOpen}
      isPlain
      dropdownItems={dropdownItems}
    />
  );
};
