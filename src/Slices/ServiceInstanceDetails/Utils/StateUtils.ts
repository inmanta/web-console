import {
  ServiceInstanceModel,
  ServiceModel,
  StateModel,
  TransferAnnotations,
  TransferModel,
} from "@/Core";

/**
 * A target state reachable from the current state, paired with the transfer that
 * produces it. Carrying the transfer forward (rather than just its target string)
 * lets callers read its `annotations` (e.g. `web_confirm`). The button* fields are
 * resolved once here (issue #7093) so `StateAction` can stay presentational.
 */
export interface StateTarget {
  target: string;
  transfer: TransferModel;

  /** Resolved Actions-dropdown label. Fallback chain: the transfer's
   * `web_button_label` -> the target state's `web_label` -> the target state name. */
  buttonLabel: string;

  /** Font Awesome icon name for the Actions-dropdown item, straight from the
   * transfer's `web_icon` annotation. No fallback. */
  buttonIcon?: string;

  buttonVariant?: TransferAnnotations["web_button_variant"];

  /** Whether the transfer's `web_advanced_state` annotation demotes it into the
   * Actions-dropdown's secondary "Advanced" disclosure (issue #7095). */
  advanced: boolean;
}

/**
 * Resolves the Actions-dropdown label for a transfer, per the fallback chain
 * described on `StateTarget.buttonLabel`.
 *
 * @param {TransferModel} transfer - the transfer producing the target state
 * @param {StateModel[]} states - the service model's lifecycle states, to look up the target's `web_label`
 * @returns {string} the resolved label
 */
const resolveButtonLabel = (transfer: TransferModel, states: StateModel[]): string => {
  if (transfer.annotations?.web_button_label) {
    return transfer.annotations.web_button_label;
  }

  const targetState = states.find((state) => state.name === transfer.target);

  return targetState?.annotations?.web_label || transfer.target;
};

/**
 * Method to find the transfer, if any, that allows on_update or on_delete from the
 * instance's current state.
 *
 * @param {ServiceInstanceModel} instance - the instance
 * @param {"on_update" | "on_delete"} transferType - the type of the current state
 * @param {ServiceModel} serviceEntity - While the request is pending, the serviceEntity can briefly be undefined.
 * @returns {TransferModel | undefined} the matching transfer, or undefined if there isn't one
 */
export const getTransferForType = (
  instance: ServiceInstanceModel,
  transferType: "on_update" | "on_delete",
  serviceEntity?: ServiceModel
): TransferModel | undefined => {
  if (typeof instance === "undefined" || !serviceEntity) {
    return undefined;
  }

  // If the action is allowed, there is a corresponding transfer in the lifecycle,
  // where the source state is the current state
  return serviceEntity.lifecycle.transfers.find(
    (transfer: TransferModel) => transfer.source === instance.state && transfer[transferType]
  );
};

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
  return getTransferForType(instance, transferType, serviceEntity) === undefined;
};

/**
 * Method to get the available set of states
 *
 * @param {string} currentState - the current state of the instance
 * @param {ServiceModel} serviceEntity - the serviceEntity Model,
 * when the query is pending, it can happen that it is briefly undefined
 * @returns a sorted (by target) array of the available target states for the service
 * model, each paired with the transfer that produces it. It can happen that none are available.
 */
export const getAvailableStateTargets = (
  currentState: string,
  serviceEntity?: ServiceModel
): StateTarget[] => {
  if (!serviceEntity) {
    return [];
  }

  // filter out the possible transfer objects that have the same source as current state.
  const possibleStatesTransfers = serviceEntity.lifecycle.transfers.filter(
    (transfer: TransferModel) => transfer.source === currentState && transfer.api_set_state
  );

  return possibleStatesTransfers
    .map((transfer: TransferModel) => ({
      target: transfer.target,
      transfer,
      buttonLabel: resolveButtonLabel(transfer, serviceEntity.lifecycle.states),
      buttonIcon: transfer.annotations?.web_icon,
      buttonVariant: transfer.annotations?.web_button_variant,
      advanced: transfer.annotations?.web_advanced_state === true,
    }))
    .sort((a, b) => (a.target < b.target ? -1 : a.target > b.target ? 1 : 0));
};

/**
 * PatternFly's `Icon` sets its own `--pf-v6-c-icon__content--Color` default directly
 * on the icon wrapper, which shadows any inherited `color` from an ancestor (e.g. a
 * CSS custom-property override placed on the menu item). react-icons does honor an
 * explicit `color`, applying it as an inline style that wins regardless - so icon
 * coloring goes through `DynamicFAIcon`'s `color` prop, not CSS (issue #7093).
 *
 * @param {string} [variant] - the transfer's `web_button_variant` annotation
 * @returns {string | undefined} the CSS color for the icon, or undefined for no override
 */
export const iconColorFor = (variant?: string): string | undefined => {
  if (variant === "danger") {
    return "var(--pf-t--global--icon--color--status--danger--default)";
  }

  if (variant === "warning") {
    return "var(--pf-t--global--icon--color--status--warning--default)";
  }

  return undefined;
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
