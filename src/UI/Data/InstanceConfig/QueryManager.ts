import {
  OneTimeQueryManager,
  Query,
  RemoteData,
  ServiceModel,
  Setting,
  Config,
  Fetcher,
  StateHelper,
} from "@/Core";
import { useEffect } from "react";
import { uniq } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"InstanceConfig">,
  Query.UsedData<"InstanceConfig">
>;

export class InstanceConfigQueryManager
  implements OneTimeQueryManager<"InstanceConfig">
{
  constructor(
    private readonly fetcher: Fetcher<"InstanceConfig">,
    private readonly stateHelper: StateHelper<"InstanceConfig">,
    private readonly serviceStateHelper: StateHelper<"Service">,
    private readonly serviceFetcher: Fetcher<"Service">,
    private readonly environment: string
  ) {}

  private getConfigUrl({
    service_entity,
    id,
  }: Query.Qualifier<"InstanceConfig">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config`;
  }

  private getServiceUrl(name: string): string {
    return `/lsm/v1/service_catalog/${name}`;
  }

  private initialize(qualifier: Query.Qualifier<"InstanceConfig">): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(RemoteData.loading(), qualifier);
    }
  }

  private async update(
    qualifier: Query.Qualifier<"InstanceConfig">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getData(this.environment, url)),
      qualifier
    );
  }

  private async updateService(
    qualifier: Query.Qualifier<"Service">,
    url: string
  ): Promise<void> {
    this.serviceStateHelper.set(
      RemoteData.fromEither(
        await this.serviceFetcher.getData(this.environment, url)
      ),
      qualifier
    );
  }

  useOneTime(query: Query.SubQuery<"InstanceConfig">): [Data, () => void] {
    const { qualifier } = query;
    const { service_entity } = qualifier;
    const serviceIdentifier = {
      name: service_entity,
      environment: this.environment,
    };
    const serviceData = this.serviceStateHelper.getHooked(serviceIdentifier);

    useEffect(() => {
      if (!RemoteData.isSuccess(serviceData)) {
        this.updateService(
          serviceIdentifier,
          this.getServiceUrl(service_entity)
        );
      }
    }, [serviceData.kind]);

    useEffect(() => {
      this.initialize(qualifier);
      this.update(qualifier, this.getConfigUrl(qualifier));
    }, [this.environment]);

    return [
      this.merge(
        this.stateHelper.getHooked(qualifier),
        this.serviceStateHelper.getHooked(serviceIdentifier)
      ),
      () => this.update(qualifier, this.getConfigUrl(qualifier)),
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
