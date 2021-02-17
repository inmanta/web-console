import { getIsListEqual } from "@/Core/Language/Utils";

export interface ResourceModel {
  resource_id: string;
  resource_state: string;
}

export interface ResourceModelWithInstance extends ResourceModel {
  instanceId: string;
}

export const isEqual = (a: ResourceModel, b: ResourceModel): boolean =>
  a.resource_id === b.resource_id && a.resource_state === b.resource_state;

export const isListEqual = getIsListEqual(isEqual);
