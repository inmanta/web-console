import {
  OneTimeQueryManager,
  Query,
  RemoteData,
  StateHelper,
  ConfigFinalizer,
  ApiHelper,
} from "@/Core";
import { useEffect } from "react";

type Data = RemoteData.Type<
  Query.Error<"GetServiceConfig">,
  Query.UsedData<"GetServiceConfig">
>;

export class ServiceConfigQueryManager
  implements OneTimeQueryManager<"GetServiceConfig">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<"GetServiceConfig">,
    private readonly configFinalizer: ConfigFinalizer<"GetServiceConfig">,
    private readonly environment: string
  ) {}

  private getConfigUrl({ name }: Query.SubQuery<"GetServiceConfig">): string {
    return `/lsm/v1/service_catalog/${name}/config`;
  }

  private initialize(query: Query.SubQuery<"GetServiceConfig">): void {
    const value = this.stateHelper.getOnce(query);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(RemoteData.loading(), query);
    }
  }

  private async update(
    query: Query.SubQuery<"GetServiceConfig">,
    url: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(url, this.environment)),
      query
    );
  }

  useOneTime(query: Query.SubQuery<"GetServiceConfig">): [Data, () => void] {
    const { environment } = this;
    const { name } = query;

    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    useEffect(() => {
      this.initialize(query);
      this.update(query, this.getConfigUrl(query));
    }, [environment]); /* eslint-disable-line react-hooks/exhaustive-deps */

    return [
      this.configFinalizer.finalize(this.stateHelper.getHooked(query), name),
      () => this.update(query, this.getConfigUrl(query)),
    ];
  }

  matches(query: Query.SubQuery<"GetServiceConfig">): boolean {
    return query.kind === "GetServiceConfig";
  }
}
