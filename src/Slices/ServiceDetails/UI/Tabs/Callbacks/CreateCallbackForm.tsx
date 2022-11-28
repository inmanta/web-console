import React, { useContext, useState } from "react";
import {
  TextInput,
  Button,
  Alert,
  AlertActionCloseButton,
} from "@patternfly/react-core";
import inlineStyles from "@patternfly/react-styles/css/components/InlineEdit/inline-edit";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import {
  Maybe,
  LogLevelsList,
  EventTypesList,
  LogLevelString,
  EventType,
} from "@/Core";
import { MultiTextSelect, SingleTextSelect } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  service_entity: string;
  numberOfColumns: number;
}

export const CreateCallbackForm: React.FC<Props> = ({
  service_entity,
  numberOfColumns,
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [logLevel, setLogLevel] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { commandResolver } = useContext(DependencyContext);

  const create = commandResolver.useGetTrigger<"CreateCallback">({
    kind: "CreateCallback",
    callback_url: url || "",
    callback_id: id || undefined,
    service_entity,
    minimal_log_level:
      logLevel === null ? undefined : (logLevel as LogLevelString),
    event_types:
      eventTypes.length <= 0 ? undefined : (eventTypes as EventType[]),
  });

  const onCreate = async () => {
    setError(null);
    const error = await create();
    if (Maybe.isSome(error)) {
      setError(error.value);
    } else {
      setUrl(null);
      setId(null);
      setLogLevel(null);
      setEventTypes([]);
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
            onChange={setUrl}
          />
        </Td>
        <Td className={inlineStyles.inlineEditInput}>
          <TextInput
            aria-label="callbackId"
            value={id || ""}
            type="text"
            onChange={setId}
          />
        </Td>
        <Td className={inlineStyles.inlineEditInput}>
          <SingleTextSelect
            options={LogLevelsList}
            selected={logLevel}
            setSelected={setLogLevel}
            toggleAriaLabel="MinimalLogLevel"
          />
        </Td>
        <StyledTd className={inlineStyles.inlineEditInput}>
          <MultiTextSelect
            options={EventTypesList}
            selected={eventTypes}
            setSelected={setEventTypes}
            toggleAriaLabel="EventTypes"
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
                isInline
                variant="danger"
                title="Something went wrong"
                actionClose={
                  <AlertActionCloseButton onClose={() => setError("")} />
                }
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
