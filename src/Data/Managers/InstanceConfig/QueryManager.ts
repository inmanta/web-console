import { useEffect } from "react";
import {
  OneTimeQueryManager,
  Query,
  RemoteData,
  StateHelper,
  ConfigFinalizer,
  ApiHelper,
} from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetInstanceConfig">,
  Query.UsedData<"GetInstanceConfig">
>;

export class InstanceConfigQueryManager
  implements OneTimeQueryManager<"GetInstanceConfig">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetInstanceConfig">,
    private readonly configFinalizer: ConfigFinalizer<"GetInstanceConfig">,
    private readonly environment: string
  ) {}

  private getConfigUrl({
    service_entity,
    id,
  }: Query.SubQuery<"GetInstanceConfig">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config`;
  }

  private initialize(query: Query.SubQuery<"GetInstanceConfig">): void {
    const value = this.stateHelper.getOnce(query);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(RemoteData.loading(), query);
    }
  }

  private async update(
    query: Query.SubQuery<"GetInstanceConfig">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(url, this.environment)),
      query
    );
  }

  useOneTime(query: Query.SubQuery<"GetInstanceConfig">): [Data, () => void] {
    const { service_entity } = query;
    const { environment } = this;

    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    useEffect(() => {
      this.initialize(query);
      this.update(query, this.getConfigUrl(query));
    }, [environment]); /* eslint-disable-line react-hooks/exhaustive-deps */

    return [
      this.configFinalizer.finalize(
        this.stateHelper.getHooked(query),
        service_entity
      ),
      () => this.update(query, this.getConfigUrl(query)),
    ];
  }

  matches(query: Query.SubQuery<"GetInstanceConfig">): boolean {
    return query.kind === "GetInstanceConfig";
  }
}
