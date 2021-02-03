// import { ServiceInstanceModelWithTargetStates } from "@app/Models/LsmModels";
import { ReactElement } from "react";

/**
 * A StatePresenter is responsible for presenting state.
 */
export interface StatePresenter {
  getForId(id: string): ReactElement | null;
}
