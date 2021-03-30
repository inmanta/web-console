import {
  DataManager,
  OneTimeHookHelper,
  ServiceInstanceIdentifier,
  Query,
  RemoteData,
  ServiceModel,
  isNotNull,
  Setting,
  Config,
} from "@/Core";
import { useEffect } from "react";
import { uniq } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"InstanceConfig">,
  Query.UsedData<"InstanceConfig">
>;

export class InstanceConfigHookHelper
  implements OneTimeHookHelper<"InstanceConfig"> {
  constructor(
    private readonly configDataManager: DataManager<"InstanceConfig">,
    private readonly serviceDataManager: DataManager<"Service">
  ) {}

  private getConfigUrl({
    service_entity,
    id,
  }: ServiceInstanceIdentifier): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config`;
  }

  private getServiceUrl(name: string): string {
    return `/lsm/v1/service_catalog/${name}`;
  }

  useOneTime(qualifier: ServiceInstanceIdentifier): [Data, () => void] {
    const { service_entity, environment } = qualifier;
    const serviceIdentifier = { name: service_entity, environment };
    const serviceData = this.serviceDataManager.get(serviceIdentifier);

    useEffect(() => {
      if (!RemoteData.isSuccess(serviceData)) {
        this.serviceDataManager.update(
          serviceIdentifier,
          this.getServiceUrl(service_entity)
        );
      }
    }, [serviceData.kind]);

    useEffect(() => {
      this.configDataManager.initialize(qualifier);
      this.configDataManager.update(qualifier, this.getConfigUrl(qualifier));
    }, [qualifier.environment]);

    return [
      this.merge(
        this.configDataManager.get(qualifier),
        this.serviceDataManager.get(serviceIdentifier)
      ),
      () =>
        this.configDataManager.update(qualifier, this.getConfigUrl(qualifier)),
    ];
  }

  matches(query: Query.SubQuery<"InstanceConfig">): boolean {
    return query.kind === "InstanceConfig";
  }

  private merge(
    configData: RemoteData.Type<string, Config>,
    serviceData: RemoteData.Type<string, ServiceModel>
  ): RemoteData.Type<string, Setting[]> {
    if (!RemoteData.isSuccess(configData)) return configData;
    if (!RemoteData.isSuccess(serviceData)) return serviceData;
    const config = configData.value;
    const service = serviceData.value;
    const options = getOptionsFromService(service);
    const settings: Setting[] = options.map((option) => ({
      name: option,
      value: getValueForOption(config[option], service.config[option]),
      defaultValue: service.config[option] || false,
    }));
    return RemoteData.success(settings);
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
