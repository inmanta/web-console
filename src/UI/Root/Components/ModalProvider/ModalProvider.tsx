import React, { PropsWithChildren, createContext, useState } from "react";
import { Modal } from "@patternfly/react-core";

interface Props {
  title: string;
  content: React.ReactNode;
  actions: React.ReactNode | null;
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
  const [content, setContent] = useState<React.ReactNode>();
  const [actions, setAction] = useState<React.ReactNode | null>(null);

  const triggerModal = (props: Props) => {
    const { title, content, actions = null } = props;

    setTitle(title);
    setContent(content);
    setIsOpen(true);
    setAction(actions);
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
        variant="small"
        title={title}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        actions={actions}
        ouiaId="GlobalModal"
      >
        {content}
      </Modal>
      {children}
    </ModalContext.Provider>
  );
};
