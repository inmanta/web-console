import React, { PropsWithChildren, createContext, useState } from "react";
import { Modal, ModalVariant, ModalBody, ModalFooter, ModalHeader } from "@patternfly/react-core";

type IconVariant = "success" | "danger" | "warning" | "info" | "custom";

/**
 * `Params` is an interface for the parameters accepted by the `triggerModal` function.
 *
 * @interface
 * @param {string} title - The title of the modal.
 * @param {string} [ariaLabel] - The aria-label of the modal.
 * @param {string} [dataTestId] - The data-testid attribute of the modal.
 * @param {React.ReactNode} [description] - The description of the modal.
 * @param {React.ReactNode} content - The content of the modal.
 * @param {React.ReactNode | undefined} [actions] - The actions of the modal.
 * @param {ModalVariant} [variant] - The variant of the modal.
 * @param {IconVariant} [iconVariant] - The variant of the icon in the modal title.
 * @param {() => void} [cancelCb] - Optional callback invoked when the modal is closed.
 * @param {boolean} [showClose] - Whether to show the close button in the modal header.
 */

export interface Params {
  title: string;
  ariaLabel?: string;
  dataTestId?: string;
  description?: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode | null;
  variant?: ModalVariant;
  iconVariant?: IconVariant;
  cancelCb?: () => void;
  showClose?: boolean;
}

/**
 * `ModalContextInterface` is an interface for the context provided by the `ModalProvider`.
 *
 * @interface
 * @property {(params: Params) => void} triggerModal - The function to trigger a modal.
 * @property {() => void} closeModal - The function to close the modal.
 */
interface ModalContextInterface {
  triggerModal: (params: Params) => void;
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
export const ModalContext = createContext<ModalContextInterface>(defaultModalContext);

/**
 * `ModalProvider` is a React functional component that provides the `ModalContext`.
 *
 * This component maintains its own state for the modal's properties and provides the `triggerModal` and `closeModal` functions through the `ModalContext`.
 * The `triggerModal` function updates the modal's properties and opens the modal.
 * The `closeModal` function closes the modal and invokes `cancelCb` if one was provided.
 *
 * The provider uses the Modal component from the patternfly-react library. For more information
 * about the Modal component and its attributes, visit: https://www.patternfly.org/components/modal/
 *
 * @prop {Object} props - The properties passed to the component.
 * @prop {React.ReactNode} children - The children to be rendered within the `ModalContext.Provider`.
 * @returns {React.FC<PropsWithChildren>} A `ModalContext.Provider` that wraps the children and a `Modal`.
 */
export const ModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [ariaLabel, setAriaLabel] = useState("GlobalModal");
  const [dataTestId, setDataTestId] = useState("GlobalModal");
  const [description, setDescription] = useState<React.ReactNode>();
  const [content, setContent] = useState<React.ReactNode>();
  const [actions, setAction] = useState<React.ReactNode | undefined>(undefined);
  const [variant, setVariant] = useState<ModalVariant>(ModalVariant.small);
  const [iconVariant, setIconVariant] = useState<IconVariant | undefined>("info");
  const [cancelCb, setCancelCb] = useState<(() => void) | null>(null);
  const [showClose, setShowClose] = useState(true);

  /**
   * Triggers the modal with the provided properties.
   *
   * This function updates the modal's properties and opens the modal.
   * The properties include the title, description, content, actions, variant, and icon variant.
   * The description defaults to `null` and actions default to `undefined` if not provided.
   * The variant defaults to `ModalVariant.small` if not provided.
   *
   * For more information about the Modal component and its attributes, visit:
   * https://www.patternfly.org/components/modal/
   *
   * @param {Params} params - The params to set for the modal.
   * @param {string} params.title - The title of the modal.
   * @param {string} [params.ariaLabel] - *optional* The aria-label of the modal.
   * @param {string} [params.dataTestId] - *optional* The data-testid attribute of the modal.
   * @param {React.ReactNode} [params.description] - *optional* The description of the modal.
   * @param {React.ReactNode} params.content - The content of the modal.
   * @param {React.ReactNode | undefined} [params.actions] - *optional* The actions of the modal.
   * @param {ModalVariant} [params.variant] - *optional* The variant of the modal.
   * @param {IconVariant} [params.iconVariant] - *optional* The variant of the icon in the modal title.
   * @param {() => void} [params.cancelCb] - *optional* Callback invoked when the modal is closed.
   * @param {boolean} [params.showClose] - *optional* Whether to show the close button in the modal header.
   */
  const triggerModal = (params: Params) => {
    const {
      title,
      ariaLabel = "GlobalModal",
      dataTestId = "GlobalModal",
      description = null,
      content,
      actions = undefined,
      variant = ModalVariant.small,
      iconVariant,
      cancelCb = null,
      showClose = true,
    } = params;

    setCancelCb(cancelCb);
    setTitle(title);
    setDescription(description);
    setAriaLabel(ariaLabel);
    setDataTestId(dataTestId);
    setContent(content);
    setIsOpen(true);
    setAction(actions);
    setVariant(variant);
    setIconVariant(iconVariant);
    setShowClose(showClose);
  };

  const closeModal = () => {
    setIsOpen(false);
    if (cancelCb) {
      cancelCb();
    }
  };

  return (
    <ModalContext.Provider
      value={{
        triggerModal,
        closeModal,
      }}
    >
      <Modal
        data-testid={dataTestId}
        aria-label={ariaLabel}
        isOpen={isOpen}
        onClose={showClose ? closeModal : undefined}
        variant={variant}
        ouiaId="GlobalModal"
        disableFocusTrap
      >
        {title && (
          <ModalHeader title={title} description={description} titleIconVariant={iconVariant} />
        )}
        {content && <ModalBody>{content}</ModalBody>}
        {actions && <ModalFooter>{actions}</ModalFooter>}
      </Modal>
      {children}
    </ModalContext.Provider>
  );
};
