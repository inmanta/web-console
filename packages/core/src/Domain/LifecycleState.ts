import { State } from "./InventoryTable";
import { StateModel } from "./ServiceModel";

/**
 * Finds the lifecycle state an instance is in, for its status color and web annotations,
 * or undefined when the lifecycle doesn't define the state.
 */
export const findLifecycleState = (
  states: StateModel[],
  stateName: string
): StateModel | undefined => states.find((state) => state.name === stateName);

/**
 * Resolves the lifecycle state of an instance: the state with its label and annotations,
 * or just the raw name when the lifecycle doesn't define it, so it still renders.
 */
export const resolveLifecycleState = (states: StateModel[], stateName: string): State =>
  findLifecycleState(states, stateName) ?? { name: stateName };
