import { EntityAnnotations, Field, FormTabDefinition } from "@/Core";
import { words } from "@/UI/words";

/**
 * A form tab together with the top-level fields that are assigned to it.
 */
export interface FormTabGroup {
  tab: FormTabDefinition;
  fields: Field[];
}

/**
 * The outcome of resolving the `web_tabs` catalog against the form's fields.
 * "untabbed" means no catalog is defined and the form renders as a single column.
 * "error" carries a model error that has to be surfaced to the user.
 * "tabs" carries the tab groups in display order and the key of the default tab,
 * which is the initially shown tab and catches fields without an assignment.
 */
export type FormTabsResolution =
  | { kind: "untabbed" }
  | { kind: "error"; message: string }
  | { kind: "tabs"; groups: FormTabGroup[]; defaultKey: string };

/**
 * Resolve the `web_tabs` catalog from the service entity's annotations against the
 * top-level form fields.
 *
 * The catalog is model-author input, so it is validated at runtime: it must be a list
 * of tabs with unique string keys and string labels, exactly one of which is marked as
 * default, and every `web_tab` assignment on a field must name a key from the catalog.
 * Tabs are ordered by ascending `order`; ties or missing values fall back to `key` so
 * the result never depends on list position.
 *
 * @param {EntityAnnotations} entityAnnotations - The service entity's annotations, if any.
 * @param {Field[]} fields - The top-level form fields with their resolved `tab` keys.
 * @returns {FormTabsResolution} The resolution to render the form with.
 */
export const resolveFormTabs = (
  entityAnnotations: EntityAnnotations | undefined,
  fields: Field[]
): FormTabsResolution => {
  // Model-author input, so treat as unknown and re-validate before trusting its shape.
  const catalog: unknown = entityAnnotations?.web_tabs;

  // No catalog defined: render the plain single-column form, exactly as before.
  if (catalog === undefined || catalog === null) {
    return { kind: "untabbed" };
  }

  // Must be an array whose every entry is a well-formed tab (also narrows the type below).
  if (!Array.isArray(catalog) || !catalog.every(isFormTabDefinition)) {
    return { kind: "error", message: words("inventory.form.tabs.invalidCatalog") };
  }

  // Keys must be unique: a smaller Set than the array means a duplicate key.
  const knownKeys = new Set(catalog.map((tab) => tab.key));

  if (knownKeys.size !== catalog.length) {
    return { kind: "error", message: words("inventory.form.tabs.invalidCatalog") };
  }

  // Exactly one tab must be the default (initially shown + catch-all for unassigned fields).
  const defaults = catalog.filter((tab) => tab.default === true);

  if (defaults.length !== 1) {
    return {
      kind: "error",
      message: words("inventory.form.tabs.defaultRequired")(defaults.length),
    };
  }

  // Every field assignment must point at a key that exists in the catalog.
  const unknownAssignment = fields.find(
    (field) => field.tab !== undefined && !knownKeys.has(field.tab)
  );

  if (unknownAssignment !== undefined) {
    return {
      kind: "error",
      message: words("inventory.form.tabs.unknownKey")(
        unknownAssignment.name,
        // Guaranteed a string by the `field.tab !== undefined` guard above.
        unknownAssignment.tab as string
      ),
    };
  }

  // All checks passed: order the tabs for display and bucket fields into them,
  // unassigned fields (`field.tab` undefined) falling back to the default tab.
  const defaultKey = defaults[0].key;
  const groups = [...catalog].sort(byOrderThenKey).map((tab) => ({
    tab,
    fields: fields.filter((field) => (field.tab ?? defaultKey) === tab.key),
  }));

  return { kind: "tabs", groups, defaultKey };
};

/**
 * Type guard validating a single entry of the model-author-supplied `web_tabs`
 * catalog: `key` and `label` are required strings, and the optional `order`, `default`
 * and `icon` must have their expected types when present.
 */
const isFormTabDefinition = (value: unknown): value is FormTabDefinition => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tab = value as Record<string, unknown>;

  return (
    typeof tab.key === "string" &&
    typeof tab.label === "string" &&
    (tab.order === undefined || typeof tab.order === "number") &&
    (tab.default === undefined || typeof tab.default === "boolean") &&
    (tab.icon === undefined || typeof tab.icon === "string")
  );
};

/**
 * Comparator that sorts tabs by ascending `order`, falling back to a `key`
 * comparison when `order` is equal or missing so the display order is deterministic
 * and never depends on list position.
 */
const byOrderThenKey = (a: FormTabDefinition, b: FormTabDefinition): number => {
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

  return orderA - orderB || a.key.localeCompare(b.key);
};
