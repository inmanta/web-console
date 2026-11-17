import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import { getShortUuidFromRaw, words } from "@inmanta/web-console-core";
import { Callback } from "@inmanta/web-console-core/Domain/Callback";
import { TextWithCopy } from "@inmanta/web-console-ui/Components/TextWithCopy";
import { DeleteButton } from "./DeleteButton";
import { Details } from "./Details";

/**
 * Props interface for the Row component
 *
 */
interface Props {
  callback: Callback;
  rowIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  numberOfColumns: number;
}

/**
 * Row is a component that renders a single row in the callbacks table.
 * It displays the callback information and, for a callback with event types, an expand toggle that shows them.
 *
 * @component
 * @props {Props} props - The component props
 * @prop {Callback} callback - The callback object to be displayed in the row
 * @prop {number} rowIndex - Position of the row in the table, used by the expand toggle
 * @prop {boolean} isExpanded - Whether the row is currently expanded
 * @prop {(): void} onToggle - Callback function to handle row expansion
 * @prop {number} numberOfColumns - Number of columns that row will occupy
 *
 * @returns {React.FC<Props>} A React component that renders a table row for a callback
 */
export const Row: React.FC<Props> = ({
  callback,
  rowIndex,
  isExpanded,
  onToggle,
  numberOfColumns,
}) => {
  const shortUuid = getShortUuidFromRaw(callback.callback_id);

  return (
    <Tbody isExpanded={false}>
      <Tr aria-label={`CallbackRow-${shortUuid}`}>
        <Td expand={callback.event_types ? { rowIndex, isExpanded, onToggle } : undefined} />
        <Td>{callback.url}</Td>
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
