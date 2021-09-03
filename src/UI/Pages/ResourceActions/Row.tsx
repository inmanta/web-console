import React from "react";
import { ResourceAction } from "@/Core";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import { Details } from "./Details";

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
        <Td>{action.messages[0].timestamp}</Td>
        <Td>{action.action}</Td>
        <Td>{action.messages[0].level}</Td>
        <Td>{presentShortMessage(action.messages[0].msg)}</Td>
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
