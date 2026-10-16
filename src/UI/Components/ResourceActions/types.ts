import { ReactNode } from "react";

/**
 * The service instance whose resources the resource actions run on. The confirm dialogs show its
 * name, and the dry run dialog offers its versions, with each state shown through renderState.
 */
export interface ResourceActionInstance {
  id: string;
  serviceEntity: string;
  name: string;
  renderState: (state: string) => ReactNode;
}
