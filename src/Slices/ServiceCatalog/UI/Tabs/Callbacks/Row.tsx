import React from "react";
import { Button } from "@patternfly/react-core";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import { getShortUuidFromRaw } from "@/Core";

import { TextWithCopy } from "@/UI/Components";
import { words } from "@/UI/words";
import { Callback } from "@S/ServiceCatalog/Core/Callback";
import { DeleteButton } from "./DeleteButton";
import { Details } from "./Details";

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
  const shortUuid = getShortUuidFromRaw(callback.callback_id);
  return (
    <Tbody isExpanded={false}>
      <Tr aria-label={`CallbackRow-${shortUuid}`}>
        <Td>{callback.url}</Td>
        <Td>
          <TextWithCopy
            value={callback.callback_id}
            tooltipContent={words("catalog.callbacks.uuid.copy")}
          >
            {shortUuid}
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
          <DeleteButton
            callback={callback}
            service_entity={service_entity}
            aria-label={`DeleteCallback-${shortUuid}`}
          />
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
