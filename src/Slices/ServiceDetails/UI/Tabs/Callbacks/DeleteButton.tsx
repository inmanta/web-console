import React, { useContext, useState } from "react";
import { Button } from "@patternfly/react-core";
import { useDeleteCallback } from "@/Data/Queries/V2/Callback";
import { ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { Callback } from "@S/ServiceDetails/Core/Callback";

interface Props {
  callback: Callback;
}

/**
 * DeleteButton component which holds the logic for deleting a callback.
 *
 * @props {Props} props - The props of the component.
 * @prop callback {Callback} - the callback object
 *
 * @returns {React.React.FC<Props>} The rendered Component to delete a callback.
 */
export const DeleteButton: React.FC<Props> = ({ callback, ...props }) => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { mutate } = useDeleteCallback({
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const [errorMessage, setErrorMessage] = useState("");

  /**
   * submit function that will close a modal and trigger the delete action
   * if there is an error, it will set the error message
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    closeModal();
    mutate(callback.callback_id);
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
            title: words("catalog.callbacks.delete.title"),
            content: (
              <>
                {words("catalog.callbacks.delete")(callback.url)}
                <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
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
