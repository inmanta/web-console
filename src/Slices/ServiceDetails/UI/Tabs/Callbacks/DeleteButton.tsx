import React, { useContext, useState } from "react";
import { Button } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { Callback } from "@S/ServiceDetails/Core/Callback";

interface Props {
  callback: Callback;
  service_entity: string;
}

/**
 * DeleteButton component which holds the logic for deleting a desired state version.
 *
 * @props {Props} props - The props of the component.
 * @param version {ParsedNumber} - the version to promote
 * @param isDisabled {boolean} - if the action is disabled
 * @returns {React.FunctionComponent}
 */
export const DeleteButton: React.FunctionComponent<Props> = ({
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

  /**
   * submit function that will close a modal and trigger the delete action
   * @returns {Promise<void>}
   */
  const onSubmit = async (): Promise<void> => {
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
            title: words("catalog.callbacks.delete.title"),
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
