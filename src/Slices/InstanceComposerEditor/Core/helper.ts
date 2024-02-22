import { ServiceModel } from "@/Core";

/**
 * Recursively filters an array of ServiceModel objects based on possible ownership of the root instance.
 *
 * @param {ServiceModel[]} services - An array of ServiceModel objects to filter.
 * @param {ServiceModel} mainService - root service to filter owned services by it.
 * @returns {ServiceModel[]} An array of owned ServiceModel objects
 */
export const filterServices = (
  services: ServiceModel[],
  mainService: ServiceModel,
): ServiceModel[] => {
  if (!mainService || !mainService.owned_entities || !Array.isArray(services)) {
    return [];
  }
  const relatedServices = services.filter((service) =>
    mainService.owned_entities.includes(service.name),
  );
  const unrelatedServices = services.filter(
    (service) => !mainService.owned_entities.includes(service.name),
  );

  const nestedRelatedServices = relatedServices.flatMap((service) =>
    filterServices(unrelatedServices, service),
  );

  return relatedServices.concat(nestedRelatedServices);
};
