import React from "react";
import { Button, Text, Tooltip } from "@patternfly/react-core";
import { AngleDownIcon, AngleRightIcon } from "@patternfly/react-icons";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { getShortUuidFromRaw } from "@/Core";
import { TextWithCopy } from "@/UI/Components";
import { words } from "@/UI/words";
import { Callback } from "@S/ServiceDetails/Core/Callback";
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
        <Td>
          {callback.event_types ? (
            <Toggle
              text={callback.url}
              onClick={onToggle}
              isExpanded={isExpanded}
            />
          ) : (
            <StyledText>{callback.url}</StyledText>
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
        <Td>
          {callback.event_types && callback.event_types.length + " Event Types"}
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
const Toggle: React.FC<{
  text: string;
  onClick: () => void;
  isExpanded: boolean;
}> = ({ text, onClick, isExpanded }) => {
  return (
    <StyledButton variant="plain" aria-label="Action" onClick={onClick}>
      {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />} {text}
    </StyledButton>
  );
};

const StyledText = styled(Text)`
  padding-left: 36px;
`;
const StyledButton = styled(Button)`
  color: var(--pf-v5-c-table--cell--Color) !important;
`;
