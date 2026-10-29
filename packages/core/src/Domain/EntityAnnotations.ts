import { EntityAnnotations, ServiceModel } from "./ServiceModel";

/**
 * The entity annotations that resolveEntityAnnotations returns, with their fallbacks applied.
 * `web_title` is always set; the other keys are undefined when neither the
 * annotation nor its fallback has a valid value.
 */
export interface ResolvedEntityAnnotations extends Pick<
  EntityAnnotations,
  "web_icon" | "web_group" | "web_order" | "web_description"
> {
  web_title: string;
}

/**
 * Resolves the title, icon, group, order and description annotations of a service entity,
 * using the fallback when an annotation is missing.
 * The annotations come from the model author, so strings are trimmed, and a value of
 * the wrong type or an empty string is ignored and the fallback is used instead.
 */
export const resolveEntityAnnotations = (serviceModel: ServiceModel): ResolvedEntityAnnotations => {
  const annotations = serviceModel.entity_annotations;
  const order: unknown = annotations?.web_order;

  return {
    web_title: getTrimmedString(annotations?.web_title) ?? serviceModel.name,
    web_icon: getTrimmedString(annotations?.web_icon),
    web_group: getTrimmedString(annotations?.web_group),
    web_order: typeof order === "number" && Number.isFinite(order) ? order : undefined,
    web_description:
      getTrimmedString(annotations?.web_description) ?? getTrimmedString(serviceModel.description),
  };
};

/**
 * Comparator that sorts services by ascending `web_order`, services without an order
 * last, and falls back to the title when the order is equal or missing.
 */
export const compareEntityAnnotations = (
  a: ResolvedEntityAnnotations,
  b: ResolvedEntityAnnotations
): number => {
  const orderA = a.web_order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.web_order ?? Number.MAX_SAFE_INTEGER;

  return orderA - orderB || a.web_title.localeCompare(b.web_title);
};

/** Returns the trimmed value when it is a non-empty string, otherwise undefined. */
const getTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed !== "" ? trimmed : undefined;
};
