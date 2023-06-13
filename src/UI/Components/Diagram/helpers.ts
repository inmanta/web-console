import { ServiceInstanceModel, ServiceModel } from "@/Core";

export const extractRelationsIds = (
  service: ServiceModel,
  instance: ServiceInstanceModel
): string[] => {
  const relationKeys = service.inter_service_relations?.map(
    (relation) => relation.name
  );
  if (!relationKeys) {
    return [];
  }
  if (instance.candidate_attributes !== null) {
    return relationKeys
      .map((key) =>
        instance.candidate_attributes !== null
          ? instance.candidate_attributes[key]
          : undefined
      )
      .filter((value) => value !== undefined) as string[];
  } else {
    return [];
  }
};
