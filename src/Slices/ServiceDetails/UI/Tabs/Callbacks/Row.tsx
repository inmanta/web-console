import React from "react";
import { Button, Content, Tooltip } from "@patternfly/react-core";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import { getShortUuidFromRaw } from "@/Core";
import { TextWithCopy } from "@/UI/Components";
import { words } from "@/UI/words";
import { Callback } from "@S/ServiceDetails/Core/Callback";
import { DeleteButton } from "./DeleteButton";
import { Details } from "./Details";

/**
 * Props interface for the Row component
 *
 */
interface Props {
  callback: Callback;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
}

/**
 * Row is a component that renders a single row in the callbacks table.
 * It displays the callback information and handles expansion to show details.
 *
 * @component
 * @props {Props} props - The component props
 * @prop {Callback} callback - The callback object to be displayed in the row
 * @prop {boolean} isExpanded - Whether the row is currently expanded
 * @prop {(): void} onExpansion - Callback function to handle row expansion
 * @prop {boolean} numberOfColumns - Number of columns that row will occupy

 * @returns {React.FC<Props>} A React component that renders a table row for a callback
 */
export const Row: React.FC<Props> = ({ callback, isExpanded, onToggle, numberOfColumns }) => {
  const shortUuid = getShortUuidFromRaw(callback.callback_id);

  return (
    <Tbody isExpanded={false}>
      <Tr aria-label={`CallbackRow-${shortUuid}`}>
        <Td>
          {callback.event_types ? (
            <Toggle text={callback.url} onClick={onToggle} isExpanded={isExpanded} />
          ) : (
            <Content>{callback.url}</Content>
          )}
        </Td>
        <Td>
          <Tooltip content={callback.callback_id}>
            <TextWithCopy
              value={callback.callback_id}
              tooltipContent={words("catalog.callbacks.uuid.copy")}
            >
              {shortUuid}
            </TextWithCopy>
          </Tooltip>
        </Td>
        <Td>{callback.minimal_log_level_text}</Td>
        <Td>{callback.event_types && callback.event_types.length + " Event Types"}</Td>
        <Td>
          <DeleteButton callback={callback} aria-label={`DeleteCallback-${shortUuid}`} />
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

const Toggle: React.FC<{
  text: string;
  onClick: () => void;
  isExpanded: boolean;
}> = ({ text, onClick, isExpanded }) => {
  return (
    <Button variant="plain" aria-label="Action" onClick={onClick}>
      {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />} {text}
    </Button>
  );
};
