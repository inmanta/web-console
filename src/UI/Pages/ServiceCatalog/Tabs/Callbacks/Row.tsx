import React from "react";
import { Callback } from "@/Core";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import { DeleteButton } from "./DeleteButton";

interface Props {
  callback: Callback;
  service_entity: string;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
  index: number;
}

export const Row: React.FC<Props> = ({
  callback,
  service_entity,
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
        <Td>{callback.url}</Td>
        <Td>{callback.callback_id}</Td>
        <Td>
          <DeleteButton callback={callback} service_entity={service_entity} />
        </Td>
      </Tr>
      {isExpanded && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>test</ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};
