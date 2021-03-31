import { Query } from "@/Core";
import qs from "qs";

export function getServiceInstancesUrl({
  name,
  filter,
  sort,
}: Query.Qualifier<"ServiceInstances">): string {
  const filterParam = filter
    ? `&${qs.stringify({ filter }, { allowDots: true, arrayFormat: "repeat" })}`
    : "";
  const sortParam = sort ? `&sort=${sort.name}.${sort.order}` : "";
  return `/lsm/v1/service_inventory/${name}?include_deployment_progress=True&limit=20${filterParam}${sortParam}`;
}
