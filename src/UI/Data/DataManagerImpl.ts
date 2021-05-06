import {
  RemoteData,
  Query,
  OneTimeDataManager,
  ContinuousDataManager,
  DataManagerKind,
  Fetcher,
  StateHelper,
  Scheduler,
} from "@/Core";
import { useEffect, useState } from "react";

type GetUnique<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => string;

type GetDependencies<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => (string | number | boolean | undefined)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class OneTimeDataManagerImpl<Kind extends Query.Kind>
  implements OneTimeDataManager<Kind> {
  constructor(
    private readonly fetcher: Fetcher<Kind>,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (qualifier: Query.Qualifier<Kind>) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>
  ) {}

  async update(qualifier: Query.Qualifier<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(
        await this.fetcher.getData(qualifier.environment, url)
      )
    );
  }

  useOneTime(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(qualifier));

    useEffect(() => {
      setUrl(this.getUrl(qualifier));
    }, this.getDependencies(qualifier));

    useEffect(() => {
      this.stateHelper.set(qualifier, RemoteData.loading());
      this.update(qualifier, url);
    }, [url, qualifier.environment]);

    return [
      RemoteData.mapSuccess(
        (d) => this.toUsed(d, setUrl),
        this.stateHelper.getHooked(qualifier)
      ),
      () => this.update(qualifier, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: DataManagerKind): boolean {
    return query.kind === this.kind && kind === "OneTime";
  }
}

export class ContinuousDataManagerImpl<Kind extends Query.Kind>
  implements ContinuousDataManager<Kind> {
  constructor(
    private readonly fetcher: Fetcher<Kind>,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly scheduler: Scheduler,
    private readonly getUnique: GetUnique<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (qualifier: Query.Qualifier<Kind>) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>
  ) {}

  async update(qualifier: Query.Qualifier<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(
        await this.fetcher.getData(qualifier.environment, url)
      )
    );
  }

  useContinuous(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(qualifier));

    useEffect(() => {
      setUrl(this.getUrl(qualifier));
    }, this.getDependencies(qualifier));

    const task = {
      effect: async () =>
        RemoteData.fromEither(
          await this.fetcher.getData(qualifier.environment, url)
        ),
      update: (data) => this.stateHelper.set(qualifier, data),
    };

    useEffect(() => {
      this.stateHelper.set(qualifier, RemoteData.loading());
      this.update(qualifier, url);
      this.scheduler.register(this.getUnique(qualifier), task);
      return () => {
        this.scheduler.unregister(this.getUnique(qualifier));
      };
    }, [url, qualifier.environment]);

    return [
      RemoteData.mapSuccess(
        (data) => this.toUsed(data, setUrl),
        this.stateHelper.getHooked(qualifier)
      ),
      () => this.update(qualifier, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: DataManagerKind): boolean {
    return query.kind === this.kind && kind === "Continuous";
  }
}
