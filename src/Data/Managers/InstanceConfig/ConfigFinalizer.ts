import { uniq } from "lodash-es";
import {
  Config,
  RemoteData,
  ServiceModel,
  ConfigFinalizer,
  Query,
  isNotNull,
  StateHelperWithEnv,
} from "@/Core";

export class InstanceConfigFinalizer
  implements ConfigFinalizer<"GetInstanceConfig">
{
  constructor(
    private readonly serviceStateHelper: StateHelperWithEnv<"GetService">
  ) {}

  finalize(
    configData: RemoteData.Type<string, Config>,
    serviceName: string,
    environment: string
  ): RemoteData.Type<string, Query.UsedData<"GetInstanceConfig">> {
    const serviceData = this.serviceStateHelper.useGetHooked(
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
    const fullConfig = options.reduce<Config>((acc, option) => {
      acc[option] = getValueForOption(config[option], service.config[option]);
      return acc;
    }, {});
    const defaults = options.reduce<Config>((acc, option) => {
      acc[option] =
        typeof service.config[option] !== "undefined"
          ? service.config[option]
          : false;
      return acc;
    }, {});
    return RemoteData.success({ config: fullConfig, defaults });
  }
}

function getOptionsFromService(service: ServiceModel): string[] {
  return uniq(
    service.lifecycle.transfers
      .map((transfer) => transfer.config_name)
      .filter(isNotNull)
  );
}

function getValueForOption(
  instance: boolean | undefined,
  service: boolean | undefined
): boolean {
  if (typeof instance !== "undefined") return instance;
  if (typeof service !== "undefined") return service;
  return false;
}
