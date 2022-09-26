import { ReactElement } from "react";
import { ServiceInstanceModelWithTargetStates } from "@/Core";

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
  | "deleted"
  | "service_identity_attribute_value"
>;

/**
 * An ActionPresenter is responsible for presenting actions.
 */
export interface ActionPresenter {
  getForId(id: string): ReactElement | null;
}
