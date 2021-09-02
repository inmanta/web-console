import React, { useContext, useState } from "react";
import { ExpandableRowContent, Tbody, Td, Tr } from "@patternfly/react-table";
import {
  TextInput,
  Button,
  Alert,
  AlertActionCloseButton,
} from "@patternfly/react-core";
import inlineStyles from "@patternfly/react-styles/css/components/InlineEdit/inline-edit";
import { Maybe } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  service_entity: string;
  numberOfColumns: number;
}

export const CreateCallbackForm: React.FC<Props> = ({
  service_entity,
  numberOfColumns,
}) => {
  const [url, setUrl] = useState("");
  const [id, setId] = useState("");
  const [error, setError] = useState("");

  const { commandResolver } = useContext(DependencyContext);
  const create = commandResolver.getTrigger<"CreateCallback">({
    kind: "CreateCallback",
    callback_url: url,
    callback_id: id.length > 0 ? id : undefined,
    service_entity,
  });

  const onCreate = async () => {
    setError("");
    const error = await create();
    if (Maybe.isSome(error)) {
      setError(error.value);
    } else {
      setUrl("");
      setId("");
    }
  };

  return (
    <Tbody>
      <Tr>
        <Td />
        <Td className={inlineStyles.inlineEditInput}>
          <TextInput
            aria-label="callbackUrl"
            value={url}
            type="text"
            onChange={setUrl}
          />
        </Td>
        <Td className={inlineStyles.inlineEditInput}>
          <TextInput
            aria-label="callbackId"
            value={id}
            type="text"
            onChange={setId}
          />
        </Td>
        <Td>
          <Button variant="secondary" onClick={onCreate}>
            Save
          </Button>
        </Td>
      </Tr>
      {!!error && (
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
