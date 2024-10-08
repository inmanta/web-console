import React, { PropsWithChildren, createContext, useState } from "react";
import { Modal, ModalVariant } from "@patternfly/react-core";

type IconVariant = "success" | "danger" | "warning" | "info" | "custom";

/**
 * `Props` is an interface for the properties accepted by the `triggerModal` function.
 *
 * @interface
 * @property {string} title - The title of the modal.
 * @property {React.ReactNode} [description] - The description of the modal.
 * @property {React.ReactNode} content - The content of the modal.
 * @property {React.ReactNode | null} [actions] - The actions of the modal.
 * @property {ModalVariant} [variant] - The variant of the modal.
 * @property {IconVariant} [iconVariant] - The variant of the icon in the modal title.
 */
interface Props {
  title: string;
  description?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode | null;
  variant?: ModalVariant;
  iconVariant?: IconVariant;
}

/**
 * `ModalContextInterface` is an interface for the context provided by the `ModalProvider`.
 *
 * @interface
 * @property {(props: Props) => void} triggerModal - The function to trigger a modal.
 * @property {() => void} closeModal - The function to close the modal.
 */
export interface ModalContextInterface {
  triggerModal: (props: Props) => void;
  closeModal: () => void;
}

/**
 * `defaultModalContext` is the object default values for the `ModalContext`.
 */
const defaultModalContext: ModalContextInterface = {
  triggerModal: () => {},
  closeModal: () => {},
};

/**
 * `ModalContext` is a context that provides the `triggerModal` and `closeModal` functions.
 *
 * @type {React.Context<ModalContextInterface>}
 */
export const ModalContext =
  createContext<ModalContextInterface>(defaultModalContext);

/**
 * `ModalProvider` is a React functional component that provides the `ModalContext`.
 *
 * This component maintains its own state for the modal's properties and provides the `triggerModal` and `closeModal` functions through the `ModalContext`.
 * The `triggerModal` function updates the modal's properties and opens the modal.
 * The `closeModal` function closes the modal.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The children to be rendered within the `ModalContext.Provider`.
 * @returns {JSX.Element} A `ModalContext.Provider` that wraps the children and a `Modal`.
 */
export const ModalProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<React.ReactNode>();
  const [content, setContent] = useState<React.ReactNode>();
  const [actions, setAction] = useState<React.ReactNode>([]);
  const [variant, setVariant] = useState<ModalVariant>(ModalVariant.small);
  const [iconVariant, setIconVariant] = useState<IconVariant | undefined>(
    "info",
  );

  /**
   * Triggers the modal with the provided properties.
   *
   * This function updates the modal's properties and opens the modal.
   * The properties include the title, description, content, actions, variant, and icon variant.
   * The description and actions default to `null` and an empty array, respectively, if they are not provided.
   * The variant defaults to `ModalVariant.small` if it is not provided.
   *
   * @param {Props} props - The properties to set for the modal.
   * @param {string} props.title - The title of the modal.
   * @param {React.ReactNode} props.[description] - The description of the modal.
   * @param {React.ReactNode} props.content - The content of the modal.
   * @param {React.ReactNode | null} props.[actions] - The actions of the modal.
   * @param {ModalVariant} props.[variant] - The variant of the modal.
   * @param {IconVariant} props.[iconVariant] - The variant of the icon in the modal title.
   */
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
