import React, { useContext, useState } from "react";
import { Button } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
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
  const { triggerModal, closeModal } = useContext(ModalContext);
  const onDelete = commandResolver.useGetTrigger<"DeleteCallback">({
    kind: "DeleteCallback",
    callbackId: callback.callback_id,
    service_entity,
  });

  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async () => {
    closeModal();
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
      <Button
        variant="secondary"
        isDanger
        onClick={() => {
          triggerModal({
            title: "Delete Callback",
            content: (
              <>
                {words("catalog.callbacks.delete")(callback.url)}
                <ConfirmUserActionForm
                  onSubmit={onSubmit}
                  onCancel={closeModal}
                />
              </>
            ),
          });
        }}
        {...props}
      >
        {words("delete")}
      </Button>
    </>
  );
};
