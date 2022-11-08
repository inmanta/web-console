import React, { useContext, useState } from "react";
import {
  AlertVariant,
  Button,
  Modal,
  ModalVariant,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Either } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ConfirmUserActionForm } from "../ConfirmUserActionForm";
import { ToastAlert } from "../ErrorToastAlert";

/**
 * This component will trigger an update of the Service Catalog.
 * When used, the user is asked to confirm his action.
 *
 * When the action is being executed,
 * the user will see a toast appear to inform the update has been requested.
 *
 * @returns ReloadButton
 */
export const CatalogReloadWidget: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const trigger = commandResolver.useGetTrigger<"ReloadCatalog">({
    kind: "ReloadCatalog",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastType, setToastType] = useState(AlertVariant.default);

  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSubmit = async () => {
    handleModalToggle();
    const result = await trigger();

    if (Either.isRight(result)) {
      setToastTitle(words("catalog.reload.success"));
      setMessage(words("catalog.reload.success.message"));
      setToastType(AlertVariant.success);
    } else {
      setToastTitle(words("catalog.reload.failed"));
      setMessage(result.value);
      setToastType(AlertVariant.danger);
    }
  };

  return (
    <>
      <ToastAlert
        title={toastTitle}
        message={message}
        setMessage={setMessage}
        type={toastType}
      />
      <ReloadButton onClick={handleModalToggle}>
        {words("catalog.button.reload")}
      </ReloadButton>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title={words("catalog.reload.modal.title")}
        onClose={handleModalToggle}
      >
        {words("catalog.reload.confirmation")}
        <ConfirmUserActionForm
          onSubmit={onSubmit}
          onCancel={handleModalToggle}
        />
      </Modal>
    </>
  );
};

const ReloadButton = styled(Button)`
  margin: 24px 0;
`;
