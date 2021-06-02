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
  Query.Error<"ServiceConfig">,
  Query.UsedData<"ServiceConfig">
>;

export class ServiceConfigQueryManager
  implements OneTimeQueryManager<"ServiceConfig">
{
  constructor(
    private readonly fetcher: Fetcher<"ServiceConfig">,
    private readonly stateHelper: StateHelper<"ServiceConfig">,
    private readonly serviceStateHelper: StateHelper<"Service">,
    private readonly serviceFetcher: Fetcher<"Service">,
    private readonly environment: string
  ) {}

  private getConfigUrl({ name }: Query.SubQuery<"ServiceConfig">): string {
    return `/lsm/v1/service_catalog/${name}/config`;
  }

  private getServiceUrl(name: string): string {
    return `/lsm/v1/service_catalog/${name}`;
  }

  private initialize(query: Query.SubQuery<"ServiceConfig">): void {
    const value = this.stateHelper.getOnce(query);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(RemoteData.loading(), query);
    }
  }

  private async update(
    query: Query.SubQuery<"ServiceConfig">,
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

  useOneTime(query: Query.SubQuery<"ServiceConfig">): [Data, () => void] {
    const { name } = query;
    const serviceQuery: Query.SubQuery<"Service"> = { kind: "Service", name };
    const serviceData = this.serviceStateHelper.getHooked(serviceQuery);

    useEffect(() => {
      if (!RemoteData.isSuccess(serviceData)) {
        this.updateService(serviceQuery, this.getServiceUrl(name));
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

  matches(query: Query.SubQuery<"ServiceConfig">): boolean {
    return query.kind === "ServiceConfig";
  }

  private merge(
    configData: RemoteData.Type<string, Config>,
    serviceData: RemoteData.Type<string, ServiceModel>
  ): RemoteData.Type<string, Config> {
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

const isNotNull = <T>(value: T | null): value is NonNullable<T> =>
  value !== null;

function getOptionsFromService(service: ServiceModel): string[] {
  return uniq(
    service.lifecycle.transfers
      .map((transfer) => transfer.config_name)
      .filter(isNotNull)
  );
}
