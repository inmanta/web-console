import { uniq } from "lodash-es";
import { isNotNull, ServiceModel } from "@/Core";

export function getConfigFromService(service: ServiceModel): string[] {
  return uniq(
    service.lifecycle.transfers
      .map((transfer) => transfer.config_name)
      .filter(isNotNull),
  );
}
