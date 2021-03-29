import {
  DataManager,
  OneTimeHookHelper,
  ServiceInstanceIdentifier,
  Query,
  RemoteData,
  ServiceModel,
  isNotNull,
  Setting,
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

  private getDependencies({
    service_entity,
    id,
  }: ServiceInstanceIdentifier): (string | number | boolean)[] {
    return [id, service_entity];
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
    });

    useEffect(() => {
      this.configDataManager.initialize(qualifier);
      this.configDataManager.update(qualifier, this.getConfigUrl(qualifier));
    }, [qualifier.environment]);
    const configData = this.configDataManager.get(qualifier);
    const merged = RemoteData.mapSuccess((service) => {
      if (!RemoteData.isSuccess(configData)) return [];
      const config = configData.value;
      const options = getOptionsFromService(service);
      const settings: Setting[] = options.map((option) => ({
        name: option,
        value: config[option] || false,
        defaultValue: service.config[option] || false,
      }));
      return settings;
    }, serviceData);

    return [
      merged,
      () =>
        this.configDataManager.update(qualifier, this.getConfigUrl(qualifier)),
    ];
  }

  matches(query: Query.SubQuery<"InstanceConfig">): boolean {
    return query.kind === "InstanceConfig";
  }
}

function getOptionsFromService(service: ServiceModel): string[] {
  return uniq(
    service.lifecycle.transfers
      .map((transfer) => transfer.config_name)
      .filter(isNotNull)
  );
}
