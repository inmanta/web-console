import React, { PropsWithChildren, createContext, useState } from "react";
import { Modal, ModalVariant } from "@patternfly/react-core";

interface Props {
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode | null;
  variant?: ModalVariant;
  iconVariant?: "success" | "danger" | "warning" | "info" | "custom";
}
export interface ModalContextInterface {
  triggerModal: (props: Props) => void;
  closeModal: () => void;
}

const defaultModalContext: ModalContextInterface = {
  triggerModal: () => {},
  closeModal: () => {},
};

export const ModalContext =
  createContext<ModalContextInterface>(defaultModalContext);

export const ModalProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<React.ReactNode>();
  const [content, setContent] = useState<React.ReactNode>();
  const [actions, setAction] = useState<React.ReactNode>([]);
  const [variant, setVariant] = useState<ModalVariant>(ModalVariant.small);
  const [iconVariant, setIconVariant] = useState<
    "success" | "danger" | "warning" | "info" | "custom" | undefined
  >("info");

  const triggerModal = (props: Props) => {
    const {
      title,
      description = null,
      content,
      actions = [],
      variant = ModalVariant.small,
      iconVariant,
    } = props;

    setTitle(title);
    setDescription(description);
    setContent(content);
    setIsOpen(true);
    setAction(actions);
    setVariant(variant);
    setIconVariant(iconVariant);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ModalContext.Provider
      value={{
        triggerModal,
        closeModal,
      }}
    >
      <Modal
        data-testid="GlobalModal"
        aria-labelledby="GlobalModal"
        disableFocusTrap
        description={description}
        variant={variant}
        title={title}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actions={actions}
        ouiaId="GlobalModal"
        titleIconVariant={iconVariant}
      >
        {content}
      </Modal>
      {children}
    </ModalContext.Provider>
  );
};
