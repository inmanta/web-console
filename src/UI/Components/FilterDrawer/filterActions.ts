import { toggleValueInList } from "@/Core";
import type { DateRange, IntRange } from "@/Core";
import { uniq } from "@/Core/Language/collection";
import type { DatePresenter } from "@/UI/Presenters";

/** Keys of F whose value is a string array - i.e. the "chip" filter fields. */
type ListKey<F> = {
  [K in keyof F]-?: NonNullable<F[K]> extends readonly string[] ? K : never;
}[keyof F];

/** Keys of F whose value is a DateRange array - i.e. the from/to date-range fields. */
type DateKey<F> = {
  [K in keyof F]-?: NonNullable<F[K]> extends readonly DateRange.Type[] ? K : never;
}[keyof F];

/** Keys of F whose value is an IntRange array - i.e. the from/to integer-range fields. */
type IntKey<F> = {
  [K in keyof F]-?: NonNullable<F[K]> extends readonly IntRange.Type[] ? K : never;
}[keyof F];

/**
 * getFilterActions.
 *
 * One set of key-scoped actions for a filter drawer, covering the three field shapes a drawer
 * works with: string "chip" lists, date ranges, and integer ranges. Each action is named after the
 * shape it operates on, so a drawer can flat-destructure whichever it needs (across all three)
 * without name collisions. See the per-action docstrings below for what each does.
 *
 * String writes normalise an emptied list to undefined and accept an optional `patch` of extra
 * fields (e.g. a page's disregardDefault flag). For the ranges, applying a bound is handled
 * upstream by TimestampRangeFilter / IntRangeFilter, so only the chip side lives here.
 *
 * @param filter - The current filter state.
 * @param setFilter - Setter to persist filter changes upstream.
 * @returns The scoped, per-shape actions described above.
 */
export const getFilterActions = <F extends object>(filter: F, setFilter: (filter: F) => void) => {
  /** Read an array field, coalescing a missing/unset value to []. Caller supplies the element type E. */
  const arrayValues = <E>(key: keyof F): E[] => {
    const value = filter[key];

    return Array.isArray(value) ? value : [];
  };

  /** Write a string list, dropping an emptied list to undefined. `patch` merges in extra fields. */
  const writeStrings = (key: ListKey<F>, values: string[], patch?: Partial<F>) => {
    setFilter({ ...filter, [key]: values.length > 0 ? values : undefined, ...patch });
  };

  return {
    // --- string "chip" lists ---

    /** Append a value to the list, deduplicated. */
    addString: (key: ListKey<F>, value: string, patch?: Partial<F>) => {
      writeStrings(key, uniq([...arrayValues<string>(key), value]), patch);
    },

    /** Add the value if absent, remove it if already present. */
    toggleString: (key: ListKey<F>, value: string, patch?: Partial<F>) => {
      writeStrings(key, uniq(toggleValueInList(value, arrayValues<string>(key))), patch);
    },

    /** Replace the whole list with the given values. */
    setStrings: (key: ListKey<F>, values: string[], patch?: Partial<F>) => {
      writeStrings(key, values, patch);
    },

    /** Remove a single value from the list. */
    removeStringChip: (key: ListKey<F>, value: string, patch?: Partial<F>) => {
      writeStrings(
        key,
        arrayValues<string>(key).filter((entry) => entry !== value),
        patch
      );
    },

    /** Clear the whole field. */
    clearStringGroup: (key: ListKey<F>, patch?: Partial<F>) => {
      setFilter({ ...filter, [key]: undefined, ...patch });
    },

    // --- date ranges (from/to, keyed by operator) ---

    /** Display labels for the range, each formatted "operator | date" through the presenter. */
    dateChips: (key: DateKey<F>, presenter: DatePresenter): string[] => {
      return arrayValues<DateRange.Type>(key).map(
        (entry) => `${entry.operator} | ${presenter.getFull(entry.date.toISOString())}`
      );
    },

    /** Remove the chip whose label matches, keyed by its leading operator. */
    removeDateChip: (key: DateKey<F>, label: string) => {
      const operator = label.split("|")[0].trim();
      const remaining = arrayValues<DateRange.Type>(key).filter(
        (entry) => entry.operator !== operator
      );

      setFilter({ ...filter, [key]: remaining.length > 0 ? remaining : undefined });
    },

    /** Clear the whole field. */
    clearDateRange: (key: DateKey<F>) => {
      setFilter({ ...filter, [key]: undefined });
    },

    // --- integer ranges (from/to, keyed by operator) ---

    /** Display labels for the range, each formatted "operator | value". */
    intChips: (key: IntKey<F>): string[] => {
      return arrayValues<IntRange.Type>(key).map((entry) => `${entry.operator} | ${entry.value}`);
    },

    /** Remove the chip whose label matches, keyed by its leading operator. */
    removeIntChip: (key: IntKey<F>, label: string) => {
      const operator = label.split("|")[0].trim();
      const remaining = arrayValues<IntRange.Type>(key).filter(
        (entry) => entry.operator !== operator
      );

      setFilter({ ...filter, [key]: remaining.length > 0 ? remaining : undefined });
    },

    /** Clear the whole field. */
    clearIntRange: (key: IntKey<F>) => {
      setFilter({ ...filter, [key]: undefined });
    },
  };
};
