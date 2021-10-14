import { words } from "@/UI/words";
import { Button, Modal, TextInput } from "@patternfly/react-core";
import React, { useState } from "react";

interface Props {
  environmentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteModal: React.FC<Props> = ({
  environmentName,
  isOpen,
  onClose,
}) => {
  const [candidateEnv, setCandidateEnv] = useState("");
  const validated = environmentName === candidateEnv ? "success" : "default";
  const [isBusy, setIsBusy] = useState(false);

  const onCloseWithClear = () => {
    setCandidateEnv("");
    onClose();
  };

  const onDelete = () => {
    setIsBusy(true);
  };

  return (
    <Modal
      variant="small"
      aria-label="Delete Environment Modal"
      title="Delete Environment"
      isOpen={isOpen}
      onClose={onCloseWithClear}
      description={words("home.environment.delete.warning")(environmentName)}
      actions={[
        <Button
          key="confirm"
          variant="danger"
          onClick={onDelete}
          isDisabled={validated !== "success" || isBusy}
        >
          Delete
        </Button>,
        <Button key="cancel" variant="plain" onClick={onCloseWithClear}>
          Cancel
        </Button>,
      ]}
    >
      <TextInput
        aria-label="Delete Environment Check"
        value={candidateEnv}
        validated={validated}
        onChange={setCandidateEnv}
      />
    </Modal>
  );
};
