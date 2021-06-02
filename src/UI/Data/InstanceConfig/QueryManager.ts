import {
  OneTimeQueryManager,
  Query,
  RemoteData,
  ServiceModel,
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
  }: Query.SubQuery<"InstanceConfig">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config`;
  }

  private getServiceUrl(name: string): string {
    return `/lsm/v1/service_catalog/${name}`;
  }

  private initialize(query: Query.SubQuery<"InstanceConfig">): void {
    const value = this.stateHelper.getOnce(query);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(RemoteData.loading(), query);
    }
  }

  private async update(
    query: Query.SubQuery<"InstanceConfig">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getData(this.environment, url)),
      query
    );
  }

  private async updateService(
    query: Query.SubQuery<"Service">,
    url: string
  ): Promise<void> {
    this.serviceStateHelper.set(
      RemoteData.fromEither(
        await this.serviceFetcher.getData(this.environment, url)
      ),
      query
    );
  }

  useOneTime(query: Query.SubQuery<"InstanceConfig">): [Data, () => void] {
    const { service_entity } = query;
    const serviceQuery: Query.SubQuery<"Service"> = {
      kind: "Service",
      name: service_entity,
    };
    const serviceData = this.serviceStateHelper.getHooked(serviceQuery);

    useEffect(() => {
      if (!RemoteData.isSuccess(serviceData)) {
        this.updateService(serviceQuery, this.getServiceUrl(service_entity));
      }
    }, [serviceData.kind]);

    useEffect(() => {
      this.initialize(query);
      this.update(query, this.getConfigUrl(query));
    }, [this.environment]);

    return [
      this.merge(
        this.stateHelper.getHooked(query),
        this.serviceStateHelper.getHooked(serviceQuery)
      ),
      () => this.update(query, this.getConfigUrl(query)),
    ];
  }

  matches(query: Query.SubQuery<"InstanceConfig">): boolean {
    return query.kind === "InstanceConfig";
  }

  private merge(
    configData: RemoteData.Type<string, Config>,
    serviceData: RemoteData.Type<string, ServiceModel>
  ): RemoteData.Type<string, Query.UsedData<"InstanceConfig">> {
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
