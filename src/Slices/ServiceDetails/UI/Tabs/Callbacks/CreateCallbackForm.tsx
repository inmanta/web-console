import React, { useState } from "react";
import {
  TextInput,
  Button,
  Alert,
  AlertActionCloseButton,
  SelectOptionProps,
} from "@patternfly/react-core";
import inlineStyles from "@patternfly/react-styles/css/components/InlineEdit/inline-edit";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import { useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { LogLevelsList, EventTypesList, LogLevelString, EventType } from "@/Core";
import { useCreateCallback, KeyFactory, keySlices } from "@/Data/Queries";
import { MultiTextSelect, SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  service_entity: string;
  numberOfColumns: number;
}

/**
 * CreateCallbackForm component
 * Provides a form for creating new callbacks.
 * It allows users to input callback URL, ID, log level, and event types, and handles the creation
 * of callbacks through the API.
 *
 * @props {Props} props - The props of the component.
 * @prop {string} service_entity  - The entity associated with the callback
 * @prop {number} numberOfColumns - The number of columns in the parent table for proper layout
 *
 * @returns {React.FC<Props>} The rendered Component to create a callback.
 */
export const CreateCallbackForm: React.FC<Props> = ({ service_entity, numberOfColumns }) => {
  const client = useQueryClient();
  const keyFactory = new KeyFactory(keySlices.callback, "get_callback");
  const [url, setUrl] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [logLevel, setLogLevel] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const logOptions: SelectOptionProps[] = LogLevelsList.map((option) => {
    return { value: option, children: option };
  });

  const { mutate } = useCreateCallback({
    onError: (error) => {
      setError(error.message);
    },
    onSuccess: () => {
      //invalidate the get_callbacks query to update the list
      client.invalidateQueries({
        queryKey: keyFactory.root(),
      });
      setUrl(null);
      setId(null);
      setLogLevel(null);
      setEventTypes([]);
    },
  });

  /**
   * Handles the creation of a new callback.
   * This function gather the input data and calls the mutation function to create a callback.
   * It resets the error state before attempting to create the callback.
   */
  const onCreate = () => {
    setError(null);
    mutate({
      callback_url: url || "",
      callback_id: id || undefined,
      service_entity,
      minimal_log_level: logLevel === null ? undefined : (logLevel as LogLevelString),
      event_types: eventTypes.length <= 0 ? undefined : (eventTypes as EventType[]),
    });
  };

  const onSelect = (selected) => {
    if (eventTypes.includes(selected)) {
      setEventTypes(eventTypes.filter((value) => value !== selected));
    } else {
      setEventTypes([...eventTypes, selected]);
    }
  };

  return (
    <Tbody>
      <Tr>
        <Td className={inlineStyles.inlineEditInput}>
          <TextInput
            aria-label="callbackUrl"
            value={url || ""}
            type="text"
            onChange={(_event, val) => setUrl(val)}
          />
        </Td>
        <Td className={inlineStyles.inlineEditInput}>
          <TextInput
            aria-label="callbackId"
            value={id || ""}
            type="text"
            onChange={(_event, val) => setId(val)}
          />
        </Td>
        <Td className={inlineStyles.inlineEditInput}>
          <SingleTextSelect
            options={logOptions}
            selected={logLevel}
            setSelected={setLogLevel}
            toggleAriaLabel="MinimalLogLevel"
          />
        </Td>
        <StyledTd className={inlineStyles.inlineEditInput}>
          <MultiTextSelect
            selected={eventTypes}
            setSelected={onSelect}
            placeholderText="Select Event Types"
            toggleAriaLabel="EventTypes"
            hasChips
            options={EventTypesList.map((option) => {
              return {
                value: option,
                children: option,
                isSelected: eventTypes.includes(option),
              };
            })}
          />
        </StyledTd>
        <Td>
          <Button variant="secondary" onClick={onCreate}>
            {words("catalog.callbacks.add")}
          </Button>
        </Td>
      </Tr>
      {error && (
        <Tr isExpanded={!!error}>
          <Td colSpan={numberOfColumns}>
            <ExpandableRowContent>
              <Alert
                data-testid="Alert Danger"
                isInline
                variant="danger"
                title="Something went wrong"
                actionClose={<AlertActionCloseButton onClose={() => setError("")} />}
              >
                <p>{error}</p>
              </Alert>
            </ExpandableRowContent>
          </Td>
        </Tr>
      )}
    </Tbody>
  );
};

const StyledTd = styled(Td)`
  &&& {
    vertical-align: inherit;
  }
`;
