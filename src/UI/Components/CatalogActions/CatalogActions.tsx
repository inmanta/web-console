import React, { useContext, useState } from "react";
import {
  AlertVariant,
  Button,
  Modal,
  ModalVariant,
  Tooltip,
} from "@patternfly/react-core";
import { FileCodeIcon } from "@patternfly/react-icons";
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
 * This component also contains the link to the LSM REST API for that active environment.
 *
 * @returns CatalogActions
 */
export const CatalogActions: React.FC = () => {
  const { commandResolver, urlManager, environmentHandler } =
    useContext(DependencyContext);

  const trigger = commandResolver.useGetTrigger<"UpdateCatalog">({
    kind: "UpdateCatalog",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastType, setToastType] = useState(AlertVariant.custom);

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
        data-testid="ToastAlert"
        title={toastTitle}
        message={message}
        setMessage={setMessage}
        type={toastType}
      />
      <StyledWrapper>
        <Tooltip content="Catalog API" entryDelay={500}>
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
          <Button onClick={handleModalToggle}>
            {words("catalog.button.update")}
          </Button>
        </Tooltip>
      </StyledWrapper>
      <Modal
        disableFocusTrap
        variant={ModalVariant.small}
        isOpen={isOpen}
        title={words("catalog.update.modal.title")}
        onClose={handleModalToggle}
      >
        <StyledParagraph>
          {words("catalog.update.confirmation.p1")}
        </StyledParagraph>
        <ul>
          {words("catalog.update.confirmation.p2")}
          <li>
            - <b>{words("catalog.update.confirmation.p3")}</b>
          </li>
          <li>
            - <b>{words("catalog.update.confirmation.p4")}</b>
          </li>
        </ul>
        <StyledParagraph>
          {words("catalog.update.confirmation.p5")}
        </StyledParagraph>
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
    padding: var(--pf-v5-global--spacer--md);
}
`;
const StyledParagraph = styled.p`
  padding-bottom: 10px;
  padding-top: 10px;
`;
