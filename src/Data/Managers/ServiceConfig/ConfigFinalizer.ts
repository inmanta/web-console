import { uniq } from "lodash";
import {
  Config,
  RemoteData,
  ServiceModel,
  ConfigFinalizer,
  isNotNull,
  StateHelperWithEnv,
} from "@/Core";

export class ServiceConfigFinalizer
  implements ConfigFinalizer<"GetServiceConfig">
{
  constructor(
    private readonly serviceStateHelper: StateHelperWithEnv<"GetService">
  ) {}

  finalize(
    configData: RemoteData.Type<string, Config>,
    serviceName: string,
    environment: string
  ): RemoteData.Type<string, Config> {
    const serviceData = this.serviceStateHelper.getHooked(
      {
        kind: "GetService",
        name: serviceName,
      },
      environment
    );
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
