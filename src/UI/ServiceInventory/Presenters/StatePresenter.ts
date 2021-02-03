import { ReactElement } from "react";

/**
 * A StatePresenter is responsible for presenting the states of a service instance.
 */
export interface StatePresenter {
  getForId(id: string): ReactElement | null;
}
