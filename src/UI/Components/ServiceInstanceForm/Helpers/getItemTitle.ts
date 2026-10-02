import { get } from "@/Core/Language/collection";

/**
 * Title a list item by its key attribute values, or by its position while none of them is filled in.
 * Several values are joined with " / "; empty values and non-scalar values are skipped.
 *
 * @param {unknown} item - The form state of the list item.
 * @param {number} index - The position of the item in the list.
 * @param {string[]} keyAttributes - The key attributes of the embedded entity.
 * @returns {string} The title of the item.
 *
 * @example
 * getItemTitle({ name: "ep-east" }, 0, ["name"]); // "ep-east"
 * getItemTitle({ name: "" }, 1, ["name"]); // "#2"
 */
export const getItemTitle = (item: unknown, index: number, keyAttributes: string[]): string => {
  const values = keyAttributes
    .map((key) => get<unknown>(item, key))
    .filter(
      (value) =>
        (typeof value === "string" && value !== "") ||
        typeof value === "number" ||
        typeof value === "boolean"
    );

  return values.length > 0 ? values.join(" / ") : `#${index + 1}`;
};
