import { Diff } from "@/Core";
import { DiffItem } from "@/UI/Components";

export const resourceToDiffItem = (resource: Diff.Resource): DiffItem => {
  return {
    id: resource.resource_id,
    status: resource.status,
    entries: Object.entries(resource.attributes).map(([key, value]) => ({
      title: key,
      fromValue: value.from_value_compare || "",
      toValue: value.to_value_compare || "",
    })),
  };
};
