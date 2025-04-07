import { Diff } from "@/Core";
import { Item } from "./types";

export const fromResourceToItem = (resource: Diff.Resource): Item => {
  return {
    id: resource.resource_id,
    status: resource.status,
    entries: Object.entries(resource.attributes).map(([key, value]) => ({
      title: key,
      fromValue: value.from_value_compare,
      toValue: value.to_value_compare,
    })),
  };
};
