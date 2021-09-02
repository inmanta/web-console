import React, { useContext } from "react";
import { Callback } from "@/Core";
import { Tbody, Td, Tr, ExpandableRowContent } from "@patternfly/react-table";
import { Button } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";

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
  const { commandResolver } = useContext(DependencyContext);
  const onDelete = commandResolver.getTrigger<"DeleteCallback">({
    kind: "DeleteCallback",
    callbackId: callback.callback_id,
    service_entity,
  });

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
          <Button
            variant="secondary"
            isDanger
            icon={<TrashAltIcon />}
            onClick={onDelete}
          />
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
