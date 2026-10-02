/**
 * Maps the status labels of the instance counts to state filters. A label stands for all
 * lifecycle states that carry it, and is active when the state filter holds exactly those states.
 */
import { StateModel } from "@/Core";
import { SummaryLabel, summaryLabels } from "@/UI/Components";

/**
 * Gets the names of the lifecycle states that carry a label.
 * States without a label belong to "no_label".
 *
 * @example getLabelStates([{ name: "up", label: "success" }, { name: "start" }], "no_label")
 * // ["start"]
 */
export const getLabelStates = (states: StateModel[], label: SummaryLabel): string[] =>
  states.filter((state) => (state.label ?? "no_label") === label).map((state) => state.name);

/**
 * Finds the label whose states match the state filter exactly, or null when none does.
 * An empty or missing state filter matches no label.
 *
 * @example getActiveLabel([{ name: "up", label: "success" }], ["up"]) // "success"
 */
export const getActiveLabel = (
  states: StateModel[],
  stateFilter: string[] | undefined
): SummaryLabel | null => {
  if (!stateFilter || stateFilter.length === 0) {
    return null;
  }

  const selected = new Set(stateFilter);

  return (
    summaryLabels.find((label) => {
      const labelStates = getLabelStates(states, label);

      return (
        labelStates.length === selected.size && labelStates.every((name) => selected.has(name))
      );
    }) ?? null
  );
};
