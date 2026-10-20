import { ReactNode } from "react";

/**
 * The service instance whose resources the resource actions run on. The confirm dialogs show its
 * label (its service identity attribute value, or its id when it has none), and the dry run dialog
 * offers its versions, with each state shown through renderState.
 */
export interface ResourceActionInstance {
  id: string;
  serviceEntity: string;
  label: string;
  renderState: (state: string) => ReactNode;
}
