import {
  OneTimeQueryManager,
  Query,
  RemoteData,
  Fetcher,
  StateHelper,
  ConfigFinalizer,
} from "@/Core";
import { useEffect } from "react";

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
    private readonly configFinalizer: ConfigFinalizer<"InstanceConfig">,
    private readonly environment: string
  ) {}

  private getConfigUrl({
    service_entity,
    id,
  }: Query.SubQuery<"InstanceConfig">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config`;
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

  useOneTime(query: Query.SubQuery<"InstanceConfig">): [Data, () => void] {
    const { service_entity } = query;

    useEffect(() => {
      this.initialize(query);
      this.update(query, this.getConfigUrl(query));
    }, [this.environment]);

    return [
      this.configFinalizer.finalize(
        this.stateHelper.getHooked(query),
        service_entity
      ),
      () => this.update(query, this.getConfigUrl(query)),
    ];
  }

  matches(query: Query.SubQuery<"InstanceConfig">): boolean {
    return query.kind === "InstanceConfig";
  }
}
