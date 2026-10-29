import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { ModalContext } from "@inmanta/web-console-core/Dependency/ModalContext";
import { Callback } from "@inmanta/web-console-core/Domain/Callback";
import { useDeleteCallback } from "@inmanta/web-console-core/Queries/Slices/Callback";
import { ConfirmUserActionForm } from "@inmanta/web-console-ui/Components/ConfirmUserActionForm";

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
  const { notifyError } = useAppAlert();
  const { mutate } = useDeleteCallback({
    onError: (error) => {
      notifyError({
        title: words("catalog.callbacks.delete.failed"),
        message: error.message,
      });
    },
  });

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
