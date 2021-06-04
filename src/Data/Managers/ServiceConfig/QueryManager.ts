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
  Query.Error<"ServiceConfig">,
  Query.UsedData<"ServiceConfig">
>;

export class ServiceConfigQueryManager
  implements OneTimeQueryManager<"ServiceConfig">
{
  constructor(
    private readonly fetcher: Fetcher<"ServiceConfig">,
    private readonly stateHelper: StateHelper<"ServiceConfig">,
    private readonly configFinalizer: ConfigFinalizer<"ServiceConfig">,
    private readonly environment: string
  ) {}

  private getConfigUrl({ name }: Query.SubQuery<"ServiceConfig">): string {
    return `/lsm/v1/service_catalog/${name}/config`;
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

  useOneTime(query: Query.SubQuery<"ServiceConfig">): [Data, () => void] {
    const { name } = query;

    useEffect(() => {
      this.initialize(query);
      this.update(query, this.getConfigUrl(query));
    }, [this.environment]);

    return [
      this.configFinalizer.finalize(this.stateHelper.getHooked(query), name),
      () => this.update(query, this.getConfigUrl(query)),
    ];
  }

  matches(query: Query.SubQuery<"ServiceConfig">): boolean {
    return query.kind === "ServiceConfig";
  }
}
