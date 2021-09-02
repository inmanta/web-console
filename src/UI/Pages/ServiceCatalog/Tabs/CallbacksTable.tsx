import React, { useContext, useState } from "react";
import { Callback, Maybe } from "@/Core";
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@patternfly/react-table";
import {
  TextInput,
  Button,
  // Alert,
  // AlertActionCloseButton,
} from "@patternfly/react-core";
import inlineStyles from "@patternfly/react-styles/css/components/InlineEdit/inline-edit";
import { TrashAltIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";

interface RowProps {
  callback: Callback;
  service_entity: string;
}

const Row: React.FC<RowProps> = ({ callback, service_entity }) => {
  const { commandResolver } = useContext(DependencyContext);
  const onDelete = commandResolver.getTrigger<"DeleteCallback">({
    kind: "DeleteCallback",
    callbackId: callback.callback_id,
    service_entity,
  });

  return (
    <Tr>
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
  );
};

interface Props {
  callbacks: Callback[];
  service_entity: string;
}

export const CallbacksTable: React.FC<Props> = ({
  callbacks,
  service_entity,
}) => {
  const [url, setUrl] = useState("");
  const [id, setId] = useState("");
  // const [error, setError] = useState("");

  const { commandResolver } = useContext(DependencyContext);
  const create = commandResolver.getTrigger<"CreateCallback">({
    kind: "CreateCallback",
    callback_url: url,
    callback_id: id.length > 0 ? id : undefined,
    service_entity,
  });

  const onCreate = async () => {
    // setError("");
    const error = await create();
    if (Maybe.isSome(error)) {
      // setError(error.value);
    } else {
      setUrl("");
      setId("");
    }
  };

  return (
    <TableComposable>
      <Thead>
        <Tr>
          <Th>Url</Th>
          <Th>Id</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {callbacks.map((cb) => (
          <Row
            key={cb.callback_id}
            callback={cb}
            service_entity={service_entity}
          />
        ))}
        <Tr>
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
          {/* {error && (
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
          )} */}
        </Tr>
      </Tbody>
    </TableComposable>
  );
};
