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
import { ToastAlert } from "../ToastAlert";

/**
 * This component will trigger an update of the Service Catalog.
 * When used, the user is asked to confirm his action.
 *
 * When the action is being executed,
 * the user will see a toast appear to inform the update has been requested.
 *
 * @returns CatalogUpdateButton
 */
export const CatalogUpdateButton: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const trigger = commandResolver.useGetTrigger<"UpdateCatalog">({
    kind: "UpdateCatalog",
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
      setToastTitle(words("catalog.update.success"));
      setMessage(words("catalog.update.success.message"));
      setToastType(AlertVariant.success);
    } else {
      setToastTitle(words("catalog.update.failed"));
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
      <StyledWrapper>
        <Button onClick={handleModalToggle}>
          {words("catalog.button.update")}
        </Button>
      </StyledWrapper>
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title={words("catalog.update.modal.title")}
        onClose={handleModalToggle}
      >
        {words("catalog.update.confirmation")}
        <ConfirmUserActionForm
          onSubmit={onSubmit}
          onCancel={handleModalToggle}
        />
      </Modal>
    </>
  );
};

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: var(--pf-global--spacer--md);
}
`;
