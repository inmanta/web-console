import { Query } from "@/Core";
import qs from "qs";

export function getServiceInstancesUrl({
  name,
  filter,
  sort,
}: Query.Qualifier<"ServiceInstances">): string {
  const filterParam = filter
    ? `&${qs.stringify(
        { filter: toRaw(filter) },
        { allowDots: true, arrayFormat: "repeat" }
      )}`
    : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20${filterParam}${sortParam}`;
}

type Filter = NonNullable<Query.Qualifier<"ServiceInstances">["filter"]>;

const toRaw = (filter: Filter): Query.RawFilter => {
  if (typeof filter === "undefined") return {};
  const {
    id,
    state,
    deleted,
    attributeSetEmpty: attribute_set_empty,
    attributeSetNotEmpty: attribute_set_not_empty,
  } = filter;
  return { id, state, deleted, attribute_set_empty, attribute_set_not_empty };
};
