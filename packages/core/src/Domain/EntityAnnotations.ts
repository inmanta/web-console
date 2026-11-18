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
 * Returns the `web_title` of a service, or its name when it has none or while the service model
 * is not available (loading, failed or missing from the catalog).
 */
export const getServiceTitle = (serviceName: string, serviceModel?: ServiceModel): string =>
  serviceModel ? resolveEntityAnnotations(serviceModel).web_title : serviceName;

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

/** A service with its annotations resolved. */
export interface AnnotatedService {
  serviceModel: ServiceModel;
  annotations: ResolvedEntityAnnotations;
}

/** A `web_group` of services; the ungrouped services come as a group without a name. */
export interface EntityAnnotationGroup {
  name?: string;
  services: AnnotatedService[];
}

/**
 * Groups services by their `web_group` annotation, the way the service catalog sections them:
 * within a group the services are ordered by `web_order` and then by title, groups by the
 * lowest `web_order` of their services and then by name, and the services without a group
 * come last, as a group without a name.
 */
export const groupByEntityAnnotations = (
  serviceModels: ServiceModel[]
): EntityAnnotationGroup[] => {
  const annotatedServices = serviceModels
    .map((serviceModel): AnnotatedService => ({
      serviceModel,
      annotations: resolveEntityAnnotations(serviceModel),
    }))
    .sort((a, b) => compareEntityAnnotations(a.annotations, b.annotations));

  const servicesByGroup = new Map<string, AnnotatedService[]>();
  const ungroupedServices: AnnotatedService[] = [];

  annotatedServices.forEach((service) => {
    const group = service.annotations.web_group;

    if (group === undefined) {
      ungroupedServices.push(service);
    } else {
      servicesByGroup.set(group, [...(servicesByGroup.get(group) || []), service]);
    }
  });

  // The services of a group are sorted, so the first one has its lowest order.
  const groups: EntityAnnotationGroup[] = [...servicesByGroup.entries()]
    .sort(([nameA, [firstA]], [nameB, [firstB]]) => {
      const orderA = firstA.annotations.web_order ?? Number.MAX_SAFE_INTEGER;
      const orderB = firstB.annotations.web_order ?? Number.MAX_SAFE_INTEGER;

      return orderA - orderB || nameA.localeCompare(nameB);
    })
    .map(([name, services]) => ({ name, services }));

  if (ungroupedServices.length > 0) {
    groups.push({ services: ungroupedServices });
  }

  return groups;
};

/** Returns the trimmed value when it is a non-empty string, otherwise undefined. */
const getTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed !== "" ? trimmed : undefined;
};

/** The icon of a service that owns other services and has no `web_icon`. */
export const ownerServiceFallbackIconName = "FaFolder";

/** The icon of a service that owns no other services and has no `web_icon`. */
export const serviceFallbackIconName = "FaCube";

/**
 * Gets the icon name of a service: its `web_icon`, or a fallback that shows whether the service
 * owns other services. The name is a React Icons Font Awesome icon, e.g. "FaCube".
 */
export const getServiceIconName = (serviceModel: ServiceModel): string =>
  resolveEntityAnnotations(serviceModel).web_icon ??
  (serviceModel.owned_entities.length > 0 ? ownerServiceFallbackIconName : serviceFallbackIconName);
