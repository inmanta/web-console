import {
  Config,
  RemoteData,
  ServiceModel,
  ConfigFinalizer,
  StateHelper,
  isNotNull,
} from "@/Core";
import { uniq } from "lodash";

export class ServiceConfigFinalizer
  implements ConfigFinalizer<"ServiceConfig">
{
  constructor(private readonly serviceStateHelper: StateHelper<"Service">) {}

  finalize(
    configData: RemoteData.Type<string, Config>,
    serviceName: string
  ): RemoteData.Type<string, Config> {
    const serviceData = this.serviceStateHelper.getHooked({
      kind: "Service",
      name: serviceName,
    });
    if (!RemoteData.isSuccess(configData)) return configData;
    if (!RemoteData.isSuccess(serviceData)) return serviceData;
    const config = configData.value;
    const service = serviceData.value;
    const options = getOptionsFromService(service);
    const fullConfig: Config = options.reduce<Config>((acc, option) => {
      acc[option] =
        typeof config[option] !== "undefined" ? config[option] : false;
      return acc;
    }, {});
    return RemoteData.success(fullConfig);
  }
}

function getOptionsFromService(service: ServiceModel): string[] {
  return uniq(
    service.lifecycle.transfers
      .map((transfer) => transfer.config_name)
      .filter(isNotNull)
  );
}
