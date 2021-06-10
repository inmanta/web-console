import { Maybe } from "@/Core";
import { DependencyContext, words } from "@/UI";
import { DeleteForm, ErrorToastAlert } from "@/UI/Components";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import React from "react";
import { useContext, useState } from "react";

export const DeleteEntityModal: React.FunctionComponent<{
  serviceName: string;
}> = ({ serviceName }) => {
  const { commandResolver } = useContext(DependencyContext);
  const trigger = commandResolver.getTrigger<"DeleteService">({
    kind: "DeleteService",
    name: serviceName,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const onSubmit = async () => {
    handleModalToggle();
    const result = await trigger();
    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };
  return (
    <>
      <ErrorToastAlert
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <Button variant="danger" onClick={handleModalToggle}>
        {words("delete")}
      </Button>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title="Delete Service Entity"
        onClose={handleModalToggle}
      >
        {words("catalog.delete.title")(serviceName)}
        <DeleteForm onSubmit={onSubmit} onCancel={handleModalToggle} />
      </Modal>
    </>
  );
};
