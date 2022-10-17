import {
  Config,
  RemoteData,
  ConfigFinalizer,
  StateHelperWithEnv,
} from "@/Core";
import { getOptionsFromService } from "@/Data/Common";

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
    const fullConfig: Config = options.reduce<Config>((acc, option) => {
      acc[option] =
        typeof config[option] !== "undefined" ? config[option] : false;
      return acc;
    }, {});
    return RemoteData.success(fullConfig);
  }
}
