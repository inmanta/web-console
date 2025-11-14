import { toggleValueInList } from "@/Core";

/**
 * invertFilter.
 *
 * Returns the opposite representation of a status filter entry by toggling the leading `!`.
 * 
 * @param {string} selection - The current status filter toggle value.
 * @returns {string} The inverted selection.
 */
export const invertFilter = (selection: string): string =>
  selection.startsWith("!") ? selection.slice(1) : `!${selection}`;

/**
 * removeInvertedSelection.
 *
 * Ensures include and exclude variants of the same status do not coexist.
 *
 * @param {string} selection - The selection that is about to be toggled.
 * @param {string[]} selectedStates - The current list of selected states.
 * @returns {string[]} The filtered selection list without the inverted counterpart.
 */
export const removeInvertedSelection = (selection: string, selectedStates: string[]): string[] => {
  const invertedFilter = invertFilter(selection);
  if (selectedStates.includes(invertedFilter)) {
    return toggleValueInList(invertedFilter, selectedStates);
  }
  return selectedStates;
};
