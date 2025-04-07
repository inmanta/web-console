import { ReactElement } from "react";

/**
 * An ActionPresenter is responsible for presenting actions.
 */
export interface ActionPresenter {
  getForId(id: string): ReactElement | null;
  getAvailableStates(): string[];
}
