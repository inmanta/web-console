import { ServiceInstanceModel, ServiceModel, TransferModel } from "@/Core";

/**
 * Method to check whether the transfer is disabled on an instance for on_update or on_delete
 *
 * @param {ServiceInstanceModel} instance - the instance
 * @param {"on_update" | "on_delete"} transferType - the type of the current state
 * @param {ServiceModel} serviceEntity - While the request is pending, the serviceEntity can briefly be undefined.
 * @returns {boolean} whether the transfer should be disabled or not
 */
export const isTransferDisabled = (
  instance: ServiceInstanceModel,
  transferType: "on_update" | "on_delete",
  serviceEntity?: ServiceModel
): boolean => {
  if (typeof instance === "undefined" || !serviceEntity) {
    return true;
  }

  // If the action is allowed, there is a corresponding transfer in the lifecycle,
  // where the source state is the current state
  const transfersFromCurrentSource = serviceEntity.lifecycle.transfers.filter(
    (transfer: TransferModel) => transfer.source === instance.state && transfer[transferType]
  );

  return transfersFromCurrentSource.length === 0;
};

/**
 * Method to get the available set of states
 *
 * @param {string} currentState - the current state of the instance
 * @param {ServiceModel} serviceEntity - the serviceEntity Model,
 * when the query is pending, it can happen that it is briefly undefined
 * @returns a sorted array of available target states for the service model.
 * It can happen that none are available.
 */
export const getAvailableStateTargets = (
  currentState: string,
  serviceEntity?: ServiceModel
): string[] => {
  if (!serviceEntity) {
    return [];
  }

  // filter out the possible transfer objects that have the same source as current state.
  const possibleStatesTransfers = serviceEntity.lifecycle.transfers.filter(
    (transfer: TransferModel) => transfer.source === currentState && transfer.api_set_state
  );

  // return the targets only as a sorted array of strings.
  return possibleStatesTransfers.map((transfer: TransferModel) => transfer.target).sort();
};

/**
 * Method to get the available set of states for the expert mode
 * In Expert mode, all states are possible targets.
 *
 * @param {ServiceModel} serviceEntity - the serviceEntity Model,
 * when the query is pending, it can happen that it is briefly undefined
 * @returns a sorted array of available target states and error states for the service model.
 */
export const getExpertStateTargets = (serviceEntity?: ServiceModel): string[] => {
  if (!serviceEntity) {
    return [];
  }

  // filter out the possible transfer objects that have the same source as current state.
  const possibleStatesTransfers = serviceEntity.lifecycle.transfers;

  /**
   * The list contains a list of all possible transfers. A transfer consists of a state and a possible future targetState.
   * A state can have mutliple targets, these will have multiple entries in the list of transfers.
   * We map over the possible transfers, an keep all the available targets, then filter out the duplicates to keep a clean list.
   */
  const possibleTargets = possibleStatesTransfers.map((transfer: TransferModel) => transfer.target);
  const possibleErrorTargets = possibleStatesTransfers
    .map((transfer: TransferModel) => transfer.error)
    .filter((error) => error !== null);

  // Combine both into a Set to remove duplicates and sort them
  const combinedTargets = new Set([...possibleTargets, ...possibleErrorTargets]);
  const sortedArrayOfTargets: string[] = Array.from(combinedTargets).sort();

  return sortedArrayOfTargets;
};
