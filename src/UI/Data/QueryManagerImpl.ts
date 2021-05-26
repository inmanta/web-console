import {
  RemoteData,
  Query,
  OneTimeQueryManager,
  ContinuousQueryManager,
  QueryManagerKind,
  Fetcher,
  StateHelper,
  Scheduler,
} from "@/Core";
import { useEffect, useState } from "react";

type GetUnique<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => string;

type GetDependencies<Kind extends Query.Kind> = (
  query: Query.SubQuery<Kind>
) => (string | number | boolean | undefined)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class OneTimeQueryManagerImpl<Kind extends Query.Kind>
  implements OneTimeQueryManager<Kind>
{
  constructor(
    protected readonly fetcher: Fetcher<Kind>,
    protected readonly stateHelper: StateHelper<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (query: Query.SubQuery<Kind>) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getData(this.environment, url)),
      query.qualifier
    );
  }

  useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const { qualifier } = query;
    const [url, setUrl] = useState(this.getUrl(query));

    useEffect(() => {
      setUrl(this.getUrl(query));
    }, this.getDependencies(query));

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), qualifier);
      this.update(query, url);
    }, [url, this.environment]);

    return [
      RemoteData.mapSuccess(
        (d) => this.toUsed(d, setUrl),
        this.stateHelper.getHooked(qualifier)
      ),
      () => this.update(query, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "OneTime";
  }
}

export class ContinuousQueryManagerImpl<Kind extends Query.Kind>
  implements ContinuousQueryManager<Kind>
{
  constructor(
    private readonly fetcher: Fetcher<Kind>,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly scheduler: Scheduler,
    private readonly getUnique: GetUnique<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (query: Query.SubQuery<Kind>) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.fetcher.getData(this.environment, url)),
      query.qualifier
    );
  }

  useContinuous(query: Query.SubQuery<Kind>): Data<Kind> {
    const { qualifier } = query;
    const [url, setUrl] = useState(this.getUrl(query));

    useEffect(() => {
      setUrl(this.getUrl(query));
    }, this.getDependencies(query));

    const task = {
      effect: async () =>
        RemoteData.fromEither(
          await this.fetcher.getData(this.environment, url)
        ),
      update: (data) => this.stateHelper.set(data, qualifier),
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), qualifier);
      this.update(query, url);
      this.scheduler.register(this.getUnique(qualifier), task);
      return () => {
        this.scheduler.unregister(this.getUnique(qualifier));
      };
    }, [url, this.environment]);

    return [
      RemoteData.mapSuccess(
        (data) => this.toUsed(data, setUrl),
        this.stateHelper.getHooked(qualifier)
      ),
      () => this.update(query, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "Continuous";
  }
}
