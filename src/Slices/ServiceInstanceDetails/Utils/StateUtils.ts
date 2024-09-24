import { ServiceInstanceModel, ServiceModel, TransferModel } from "@/Core";

export const isTransferDisabled = (
  instance: ServiceInstanceModel,
  transferType: "on_update" | "on_delete",
  serviceEntity?: ServiceModel,
): boolean => {
  if (typeof instance === "undefined" || !serviceEntity) {
    return true;
  }

  // If the action is allowed, there is a corresponding transfer in the lifecycle,
  // where the source state is the current state
  const transfersFromCurrentSource = serviceEntity.lifecycle.transfers.filter(
    (transfer: TransferModel) =>
      transfer.source === instance.state && transfer[transferType],
  );

  return transfersFromCurrentSource.length === 0;
};

export const getAvailableStateTargets = (
  currentState: string,
  serviceEntity?: ServiceModel,
): string[] => {
  if (!serviceEntity) {
    return [];
  }

  // filter out the possible transfer objects that have the same source as current state.
  const possibleStatesTransfers = serviceEntity.lifecycle.transfers.filter(
    (transfer: TransferModel) =>
      transfer.source === currentState && transfer.api_set_state,
  );

  // return the targets only as an array of strings.
  return possibleStatesTransfers.map(
    (transfer: TransferModel) => transfer.target,
  );
};

export const getExpertStateTargets = (
  serviceEntity?: ServiceModel,
): string[] => {
  if (!serviceEntity) {
    return [];
  }

  // filter out the possible transfer objects that have the same source as current state.
  const possibleStatesTransfers = serviceEntity.lifecycle.transfers;

  const possibleTargets = new Set(
    possibleStatesTransfers.map((transfer: TransferModel) => transfer.target),
  );

  const sortedArrayOfTargets: string[] = Array.from(possibleTargets).sort();

  return sortedArrayOfTargets;
};
