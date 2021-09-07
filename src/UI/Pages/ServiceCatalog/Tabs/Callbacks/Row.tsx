import React from "react";
import { Callback, getShortUuidFromRaw } from "@/Core";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import { DeleteButton } from "./DeleteButton";

import { TextWithCopy } from "@/UI/Components";
import { words } from "@/UI/words";
import { Button } from "@patternfly/react-core";
import { Details } from "./Details";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";

interface Props {
  callback: Callback;
  service_entity: string;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
}

export const Row: React.FC<Props> = ({
  callback,
  service_entity,
  isExpanded,
  onToggle,
  numberOfColumns,
}) => {
  return (
    <Tbody isExpanded={false}>
      <Tr>
        <Td>{callback.url}</Td>
        <Td>
          <TextWithCopy
            value={callback.callback_id}
            tooltipContent={words("catalog.callbacks.uuid.copy")}
          >
            {getShortUuidFromRaw(callback.callback_id)}
          </TextWithCopy>
        </Td>
        <Td>{callback.minimal_log_level}</Td>
        <Td>
          {callback.event_types && (
            <ListWithTeaser
              items={callback.event_types}
              onClick={onToggle}
              isExpanded={isExpanded}
            />
          )}
        </Td>
        <Td>
          <DeleteButton callback={callback} service_entity={service_entity} />
        </Td>
      </Tr>
      {isExpanded && callback.event_types && (
        <Tr isExpanded={isExpanded}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <Details event_types={callback.event_types} />
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

const ListWithTeaser: React.FC<{
  items: string[];
  onClick: () => void;
  isExpanded: boolean;
}> = ({ items, onClick, isExpanded }) => {
  if (items.length <= 0) return null;
  const teaser = `${items[0].substr(0, 8)}... (${items.length})`;
  return (
    <Button variant="plain" aria-label="Action" onClick={onClick}>
      {teaser} {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
    </Button>
  );
};
