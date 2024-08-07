import React, { useContext, useState } from "react";
import { Button, Modal, ModalVariant } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Callback } from "@S/ServiceDetails/Core/Callback";

interface DeleteProps {
  callback: Callback;
  service_entity: string;
}

export const DeleteButton: React.FunctionComponent<DeleteProps> = ({
  service_entity,
  callback,
  ...props
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const onDelete = commandResolver.useGetTrigger<"DeleteCallback">({
    kind: "DeleteCallback",
    callbackId: callback.callback_id,
    service_entity,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async () => {
    setIsOpen(false);
    const result = await onDelete();

    if (Maybe.isSome(result)) {
      setErrorMessage(result.value);
    }
  };

  return (
    <>
      <ToastAlert
        data-testid="ToastAlert"
        title={words("catalog.callbacks.delete.failed")}
        message={errorMessage}
        setMessage={setErrorMessage}
      />
      <Modal
        disableFocusTrap
        variant={ModalVariant.small}
        isOpen={isOpen}
        title="Delete Callback"
        onClose={() => setIsOpen(false)}
      >
        {words("catalog.callbacks.delete")(callback.url)}
        <ConfirmUserActionForm
          onSubmit={onSubmit}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
      <Button
        variant="secondary"
        isDanger
        onClick={() => setIsOpen(true)}
        {...props}
      >
        {words("delete")}
      </Button>
    </>
  );
};
