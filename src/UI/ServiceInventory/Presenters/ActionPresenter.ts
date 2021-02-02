import { ServiceInstanceModelWithTargetStates } from "@app/Models/LsmModels";
import { ReactElement } from "react";

export type ServiceInstanceForAction = Pick<
  ServiceInstanceModelWithTargetStates,
  | "id"
  | "state"
  | "version"
  | "service_entity"
  | "candidate_attributes"
  | "active_attributes"
  | "rollback_attributes"
  | "environment"
  | "instanceSetStateTargets"
>;

/**
 * An ActionPresenter is responsible for presenting actions.
 */
export interface ActionPresenter {
  getForId(id: string): ReactElement | null;
}
