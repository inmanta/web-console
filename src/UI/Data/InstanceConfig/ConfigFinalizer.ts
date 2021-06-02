import {
  Config,
  RemoteData,
  ServiceModel,
  ConfigFinalizer,
  Query,
  StateHelper,
} from "@/Core";
import { uniq } from "lodash";

export class InstanceConfigFinalizer
  implements ConfigFinalizer<"InstanceConfig">
{
  constructor(private readonly serviceStateHelper: StateHelper<"Service">) {}

  finalize(
    configData: RemoteData.Type<string, Config>,
    name: string
  ): RemoteData.Type<string, Query.UsedData<"InstanceConfig">> {
    const serviceData = this.serviceStateHelper.getHooked({
      kind: "Service",
      name,
    });
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

const isNotNull = <T>(value: T | null): value is NonNullable<T> =>
  value !== null;

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
