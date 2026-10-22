import React, { createContext } from "react";
import { ModalVariant } from "@patternfly/react-core";

export type IconVariant =
  "success" | "danger" | "warning" | "info" | "custom" | React.ComponentType;

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
 * @param {IconVariant} [iconVariant] - The variant of the icon in the modal title, or an icon component.
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
export interface ModalContextInterface {
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
