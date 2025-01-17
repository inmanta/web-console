import React, { useContext, useState } from "react";
import {
  AlertVariant,
  Button,
  Content,
  Flex,
  Tooltip,
} from "@patternfly/react-core";
import { FileCodeIcon } from "@patternfly/react-icons";
import { Either } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { ConfirmUserActionForm } from "../ConfirmUserActionForm";
import { ToastAlert } from "../ToastAlert";

/**
 * This component will trigger an update of the Service Catalog.
 * When used, the user is asked to confirm his action.
 *
 * When the action is being executed,
 * the user will see a toast appear to inform the update has been requested.
 *
 * This component also contains the link to the LSM REST API for that active environment.
 *
 * @returns CatalogActions
 */
export const CatalogActions: React.FC = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { commandResolver, urlManager, environmentHandler } =
    useContext(DependencyContext);

  const trigger = commandResolver.useGetTrigger<"UpdateCatalog">({
    kind: "UpdateCatalog",
  });

  const [message, setMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastType, setToastType] = useState(AlertVariant.custom);

  /**
   * Handles the submission of the form.
   *
   * This function closes the modal and triggers an asynchronous operation.
   * If the operation is successful, it sets the toast title, message, and type to indicate success.
   * If the operation fails, it sets the toast title, message, and type to indicate failure.
   * The message in case of failure is the value of the result.
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const onSubmit = async (): Promise<void> => {
    closeModal();
    const result = await trigger();

    if (Either.isRight(result)) {
      setToastTitle(words("catalog.update.success"));
      setMessage(words("catalog.update.success.message"));
      setToastType(AlertVariant.success);
    } else {
      setToastTitle(words("catalog.update.failed"));
      setMessage(result.value);
      setToastType(AlertVariant.danger);
    }
  };

  /**
   * Opens a modal with a confirmation form.
   *
   * @returns {void}
   */
  const openModal = (): void => {
    triggerModal({
      title: words("catalog.update.modal.title"),
      content: (
        <>
          <Content>{words("catalog.update.confirmation.p1")}</Content>
          <Content>
            <b>{words("catalog.update.confirmation.p2")}</b>
          </Content>
          <Content component="ul">
            <Content component="li">
              - <b>{words("catalog.update.confirmation.p3")}</b>
            </Content>
            <Content component="li">
              - <b>{words("catalog.update.confirmation.p4")}</b>
            </Content>
          </Content>
          <Content>{words("catalog.update.confirmation.p5")}</Content>
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  return (
    <>
      <ToastAlert
        data-testid="ToastAlert"
        title={toastTitle}
        message={message}
        setMessage={setMessage}
        type={toastType}
      />
      <Flex
        direction={{ default: "row" }}
        fullWidth={{ default: "fullWidth" }}
        justifyContent={{ default: "justifyContentFlexEnd" }}
      >
        <Tooltip content={words("catalog.API.tooltip")} entryDelay={500}>
          <Button
            variant="plain"
            aria-label="API-Documentation"
            icon={<FileCodeIcon />}
            component="a"
            href={urlManager.getLSMAPILink(environmentHandler.useId())}
            target="_blank"
          ></Button>
        </Tooltip>
        <Tooltip content={words("catalog.update.tooltip")}>
          <Button onClick={openModal}>{words("catalog.button.update")}</Button>
        </Tooltip>
      </Flex>
    </>
  );
};
